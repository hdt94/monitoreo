import json
import logging


def parse_pubsub_message(message):
    logging.info(f'New message: {message}')

    eventType = message.attributes['eventType']
    data = json.loads(message.data.decode('utf-8'), parse_int=float)

    if (eventType == 'submission'):
        return data
    elif (eventType == 'OBJECT_FINALIZE'):
        file = f'gs://{data["bucket"]}/{data["name"]}'
        metadata = data["metadata"]

        return {
            "files": [file],
            "metadata": metadata,
        }
    else:
        raise TypeError(f'Unsupported event type "{eventType}"')
