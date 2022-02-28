import argparse
import datetime
import json
import logging
import sys


import apache_beam as beam
from apache_beam.io import ReadFromPubSub
from apache_beam.options.pipeline_options import GoogleCloudOptions, PipelineOptions, SetupOptions

from monitoreo.config import setup_from_args
from monitoreo.io import postgresio
from monitoreo.io import reftekio_refactor as reftekio
from monitoreo.io.fileio import FlatMatchAll
from monitoreo.io.pubsubio import parse_pubsub_message
from monitoreo.processing.modal import ModalIdFn
from monitoreo.processing.response import ProcessResponseFn


# class DefaultDataflowOptions(PipelineOptions):
class DefaultDataflowOptions(GoogleCloudOptions):
    @classmethod
    def _add_argparse_args(cls, parser):
        parser.add_argument('--disk_size_gb', default='50', type=int)
        parser.add_argument('--machine_type', default='n1-standard-2')


def element_to_row(element, default_metadata={}):
    return {
        'data': element['data'],
        'metadata': {
            **default_metadata,
            **element['metadata'],
            'path': element['path'],
        }
    }


def start(analysis_config, env_config, input_config, metadata, pipeline_args, save_main_session=False):
    analytics_source_config = postgresio.db_source_config_from_env_config(
        env_config)
    measures_table_config = postgresio.db_table_config(
        name='measures',
        primary_key_columns=['measures_id']
    )
    results_table_config = postgresio.db_table_config(
        name='results',
        primary_key_columns=['results_id']
    )

    if ("topic" in input_config and "--streaming" not in pipeline_args):
        pipeline_args.append("--streaming")

    pipeline_options = PipelineOptions(pipeline_args)
    pipeline_options.view_as(
        SetupOptions).save_main_session = save_main_session

    runner = pipeline_options.display_data().get('runner', '')
    if (runner.lower() == 'dataflowrunner'):
        pipeline_options.view_as(DefaultDataflowOptions)

    with beam.Pipeline(options=pipeline_options) as pipe:
        if ("topic" in input_config):
            patterns = (
                pipe
                | "Read from Pub/Sub" >> ReadFromPubSub(
                    topic=input_config['topic'],
                    with_attributes=True)
                | "Parse messages" >> beam.Map(parse_pubsub_message)
            )
        elif ("files" in input_config):
            single_element = {
                "files": input_config["files"]
            }
            patterns = (
                pipe
                | "Create elements" >> beam.Create([single_element])
            )
        else:
            raise Exception("Unknown input configuration")

        # TODO optimize base on size
        responses = (
            patterns
            | FlatMatchAll()
            | reftekio.ReadPasscalFiles()
            | reftekio.PreProcessChannels()
            # | "Process response" >> beam.ParDo(ProcessResponseFn())
            | "Process response" >> beam.ParDo(ProcessResponseFn(analysis_config))
        )

        # max amplitude metric may be positive or negative signed
        responses_metrics = (
            responses
            | beam.Map(reftekio.reftek_obspy_stream_to_response_metrics_dict)
        )

        modal_results = (
            responses
            | "Process Modal ID" >> beam.ParDo(ModalIdFn(analysis_config))
        )

        # Writing responses (decimation to reduce visualization payloads)
        (
            responses
            | "Process response for writes" >> beam.ParDo(ProcessResponseFn(
                default_analysis={
                    "response": {
                        "use_obspy": True,
                        "decimate_ratio": 20
                    }
                },
                enforce_default_analysis=True))
            | beam.Map(reftekio.reftek_obspy_stream_to_response_dict)
            | "Responses to rows" >> beam.Map(element_to_row, default_metadata=metadata)
            | 'Writing responses' >> postgresio.Write(
                source_config=analytics_source_config,
                table_config=measures_table_config
            )
            # unique id per measures: metadata: file, executionId, userId
        )

        # Writing responses metrics
        (
            responses_metrics
            | "Responses metrics to rows" >> beam.Map(element_to_row, default_metadata=metadata)
            | 'Writing responses metrics' >> postgresio.Write(
                source_config=analytics_source_config,
                table_config=results_table_config
            )
        )

        # Writing modal results
        (
            modal_results
            | "Modal results to rows" >> beam.Map(element_to_row, default_metadata=metadata)
            | 'Write results' >> postgresio.Write(
                source_config=analytics_source_config,
                table_config=results_table_config
            )
        )


if __name__ == "__main__":
    logging.getLogger().setLevel(logging.INFO)

    try:
        setup_dict = setup_from_args()
    except Exception as exc:
        logging.error(f"Error in setup: {exc}")
        sys.exit(1)

    try:
        start(**setup_dict)
    except Exception as exc:
        logging.error(f"Error in start: {exc}")
        sys.exit(2)
