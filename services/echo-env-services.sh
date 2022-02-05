#!/bin/bash

set -e

DIR=$(realpath $(dirname $0))

SERVICES_CONFIG_FILE=$DIR/services.config.json

for service_config in $(jq -c '.[]' $SERVICES_CONFIG_FILE); do
    SERVICE=$(jq -r '.directory' <<< "${service_config}");
    PORT=$(jq -r '.port' <<< "${service_config}");
    PORT_HOST=$(jq -r '.port_host' <<< "${service_config}");
    PORT_HOST_DEBUG=$(jq -r '.port_host_debug' <<< "${service_config}");

    echo "
PATH_SERVICE_${SERVICE^^}=$DIR/$SERVICE
PORT_SERVICE_${SERVICE^^}=$PORT
PORT_HOST_SERVICE_${SERVICE^^}=$PORT_HOST
PORT_HOST_DEBUG_SERVICE_${SERVICE^^}=$PORT_HOST_DEBUG"
done
