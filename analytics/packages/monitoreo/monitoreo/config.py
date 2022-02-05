import argparse
import json
import logging


from os import environ
from uuid import uuid4

from dotenv import dotenv_values
from google.cloud import secretmanager


def get_args(argv=None):
    parser = argparse.ArgumentParser()
    parser.add_argument("--input-files", required=False)
    parser.add_argument("--input-topic", required=False)
    parser.add_argument("--analysis-file", required=False)
    parser.add_argument("--analysis-literal", required=False)
    parser.add_argument("--env", action="store_const",
                        const=True, required=False)
    parser.add_argument("--env-file", required=False)
    parser.add_argument("--env-literal", required=False)
    parser.add_argument("--env-cloud-secret", required=False)
    parser.add_argument("--flex-args", required=False)
    parser.add_argument("--metadata-file", required=False)
    parser.add_argument("--metadata-literal", required=False)

    known_args, pipeline_args = parser.parse_known_args(argv)
    logging.info(known_args)

    return (known_args, pipeline_args)


def get_json_config(name, file_path=None, str_literal=None, parse_int=int):
    if (str_literal):
        json_config = json.loads(str_literal, parse_int=parse_int)

        return json_config
    elif (file_path):
        json_config={}
        try:
            with open(file_path, 'r') as file:
                json_config = json.load(file, parse_int=parse_int)
        except FileNotFoundError as exc:
            raise FileNotFoundError(f'Invalid "{name}" file: {exc}')

        return json_config

    # Determining possible errors
    if (type(str_literal) == str and len(str_literal) == 0):
        raise Exception('Invalid empty "{name}" str_literal')

    return {}


def get_analysis_config(analysis_file=None, analysis_literal=None):
    if (analysis_literal):
        analysis_config = json.loads(analysis_literal)

        return analysis_config
    elif (analysis_file):
        try:
            with open(analysis_file, 'r') as file:
                analysis_config = json.load(file, parse_int=float)
        except FileNotFoundError as exc:
            raise FileNotFoundError(f"Invalid analysis file: {exc}")

        return analysis_config

    # Determining possible errors
    if (type(analysis_literal) == str and len(analysis_literal) == 0):
        raise Exception("Invalid empty analysis literal")

    return {}


def get_env_config(env=False, env_literal=None, env_file=None, cloud_secret=None):
    def parse_env_literal(literal):
        lines = [line.split("=") for line in literal.split("\n")]
        pairs = filter(lambda x: len(x) > 1, lines)
        env_config = {key.strip(): val for key, val in pairs}

        return env_config

    if (env):
        return environ
    elif (env_literal):
        env_config = parse_env_literal(env_literal)

        return env_config
    elif (env_file):
        try:
            env_config = dotenv_values(env_file)
        except TypeError as exc:
            raise TypeError(f'Invalid env file "{env_file}"')

        return env_config
    elif (cloud_secret):
        client = secretmanager.SecretManagerServiceClient()
        response = client.access_secret_version(
            request={"name": cloud_secret, })
        secret = response.payload.data.decode("UTF-8")
        env_config = parse_env_literal(secret)

        return env_config

    # Determining possible errors
    # if (type(env_literal) == str and len(env_literal) == 0):
    #     raise Exception("Invalid empty env literal")

    raise Exception(f"Invalid definition of env configuration")


def get_input_config(input_files=None, input_topic=None):
    if (input_files):
        return {
            "files": input_files.split("::")
        }
    elif (input_topic):
        return {
            "topic": input_topic
        }

    raise TypeError("Invalid definition of input config")


def setup_from_args(argv=None):
    (known_args, pipeline_args) = get_args(argv)

    input_args = {
        "input_files": known_args.input_files,
        "input_topic": known_args.input_topic,
    }

    input_config = get_input_config(**input_args)

    logging.info("analysis_config")
    analysis_args = {
        "file_path": known_args.analysis_file,
        "str_literal": known_args.analysis_literal,
        "parse_int": float
    }
    analysis_config = get_json_config("analysis", **analysis_args)
    # analysis_config = get_analysis_config(**analysis_args)
    logging.info(analysis_config)

    env_args = {
        'env': known_args.env,
        "env_file": known_args.env_file,
        "env_literal": known_args.env_literal,
        "cloud_secret": known_args.env_cloud_secret
    }
    logging.info("env_config")
    env_config = get_env_config(**env_args)
    logging.info(env_config)

    if (known_args.flex_args):
        pipeline_args.extend(known_args.flex_args.split(" "))

    logging.info("metadata")
    metadata_args = {
        "file_path": known_args.metadata_file,
        "str_literal": known_args.metadata_literal,
        "parse_int": float
    }
    metadata = get_json_config("metadata", **metadata_args)
    if ('execution_id' not in metadata):
        metadata['execution_id'] = str(uuid4())
    logging.info(metadata)

    return {
        "analysis_config": analysis_config,
        "env_config": env_config,
        "input_config": input_config,
        "metadata": metadata,
        "pipeline_args": pipeline_args
    }
