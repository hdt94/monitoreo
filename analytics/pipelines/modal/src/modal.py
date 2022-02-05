import argparse
import datetime
import json
import logging
import sys


import apache_beam as beam
from apache_beam.io import ReadFromPubSub
from apache_beam.options.pipeline_options import GoogleCloudOptions, PipelineOptions, SetupOptions

# from create_analysis import create_analysis

from monitoreo.config import setup_from_args
from monitoreo.io import postgresio
from monitoreo.io import reftekio_refactor as reftekio
from monitoreo.io.fileio import FlatMatchAll
from monitoreo.io.pubsubio import parse_pubsub_message
from monitoreo.processing.modal import ModalIdFn
from monitoreo.processing.response import detrend_response, ProcessResponseFn
# from monitoreo.types import obspy_stream_to_response


# class DefaultDataflowOptions(PipelineOptions):
class DefaultDataflowOptions(GoogleCloudOptions):
    @classmethod
    def _add_argparse_args(cls, parser):
        parser.add_argument('--disk_size_gb', default='50', type=int)
        parser.add_argument('--machine_type', default='e2-standard-2')


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
        # working
        #     | "Create elements of files" >> beam.Create([{
        #         "patterns": ["/home/vagrant/labs/monitoreo/analytics/pipelines/modal/data/222400000_0002BF20", "/home/vagrant/labs/monitoreo/analytics/pipelines/modal/data/*"],
        #         "metadata": {
        #             "execution_id": 345345
        #         }
        #     }])
        #     | FlatMatchAll()
        # )
        if ("topic" in input_config):
            patterns = (
                pipe
                | "Read from Pub/Sub" >> ReadFromPubSub(
                    topic=input_config['topic'],
                    # subscription='projects/natural-stacker-335613/subscriptions/shell',
                    with_attributes=True)
                | "Parse messages" >> beam.Map(parse_pubsub_message)
            )
            # patterns = (
            #     pipe
            #     | "Read from Pub/Sub" >> ReadFromPubSub(topic=input_config['topic'])
            #     | "Parse JSON messages" >> beam.Map(json.load)
            # return loads(fp.read(),
            # AttributeError: 'bytes' object has no attribute 'read' [while running 'Parse JSON messages']
            # )

            # message = (
            #     pipe
            #     | "Read from Pub/Sub" >> ReadFromPubSub(topic=input_config['topic'])
            # )
            # # message | "Read from Pub/Sub" >> ReadFromPubSub(topic=input_config['topic'])
            # patterns = (
            #     message
            #     | "Decode messages" >> beam.Map(lambda x: x.decode('utf-8'))
            #     | "Parse JSON messages" >> beam.Map(lambda x: json.loads(x, parse_int=float))
            #     # return loads(fp.read(),
            #     # AttributeError: 'str' object has no attribute 'read' [while running 'Parse JSON messages']
            # )

        elif ("files" in input_config):
            single_element = {
                # "analysis": analysis_config,
                "files": input_config["files"]
            }
            # Single element PCollection
            patterns = (
                pipe
                | "Create elements" >> beam.Create([single_element])
            )
        else:
            raise Exception("Unknown input configuration")

        # patterns | beam.Map(logging.info)

        # TODO optimize base on size
        responses = (
            patterns
            | FlatMatchAll()
            | reftekio.ReadPasscalFiles()
            | reftekio.PreProcessChannels()
            # | "Process response" >> beam.ParDo(ProcessResponseFn())
            | "Process response" >> beam.ParDo(ProcessResponseFn(analysis_config))
        )

        results = (
            responses
            # | "Process Modal ID" >> beam.ParDo(ModalIdFn())
            | "Process Modal ID" >> beam.ParDo(ModalIdFn(analysis_config))
        )

        # Writing responses
        (
            responses
            | beam.Map(reftekio.reftek_obspy_stream_to_response_dict)
            | "Responses to rows" >> beam.Map(element_to_row, default_metadata=metadata)
            | 'Writing responses' >> postgresio.Write(
                source_config=analytics_source_config,
                table_config=measures_table_config
            )
            # measures_chunks.metadata.file
            #  metadata = {'times': times, 'sampling_rate':}
            # unique id per measures: metadata: file, executionId, userId
        )

        # Writing results
        (
            results
            | "Results to rows" >> beam.Map(element_to_row, default_metadata=metadata)
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
