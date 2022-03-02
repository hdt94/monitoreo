#!/bin/bash

set -e

DIR=$(dirname $0)
ACTION=$1
CONTAINER_NAME="monitoreo-proxy-cloud-sql"

if [[ -z $ACTION ]]; then
    echo 'Undefined "ACTION"' >&2
    exit 1

elif [[ $ACTION == "remove" ]]; then
    echo "Stopping proxy..."
    docker stop $CONTAINER_NAME
    docker rm $CONTAINER_NAME

elif [[ $ACTION == "run" ]]; then
    CONFIGS=$2

    if [[ -z $CONFIGS ]]; then
        CONFIGS=$($DIR/read-database-configs.sh)
    fi
    if [[ -z $TERRAFORM_OUTPUT ]]; then
        echo 'Undefined "TERRAFORM_OUTPUT"' >&2
        exit 1
    fi

    configs_docker_ports() {
        for config in $(</dev/stdin); do
            PORT=$(echo $config | jq -r .proxy_port)
            echo "-p 127.0.0.1:${PORT}:5432"
        done
    }

    configs_proxy_connection() {
        for config in $(</dev/stdin); do
            INSTANCE=$(echo $config | jq -r .database_instance)
            PORT=$(echo $config | jq -r .proxy_port)

            CONNECTION_NAME=$(echo $TERRAFORM_OUTPUT | jq -r ".databases_instances.value.\"${INSTANCE}\".connection_name")

            echo ${CONNECTION_NAME}=tcp:0.0.0.0:${PORT}
        done
    }

    DOCKER_PORTS_MAPPING=$(echo $CONFIGS | jq -c .[] | configs_docker_ports | tr '\n' ' ')
    INSTANCES=$(echo $CONFIGS | jq -c .[] | configs_proxy_connection | tr '\n' ',' | sed 's|,$|\n|')

    RUNNING="$(docker ps -a -q -f name=$CONTAINER_NAME)"
    if [[ $RUNNING ]]; then
        echo "Removing current container..."
        docker stop $CONTAINER_NAME > /dev/null
        docker rm $CONTAINER_NAME > /dev/null
    fi

    echo "Creating Cloud SQL Auth proxy container..."
    if [[ $GOOGLE_CLOUD_SHELL == true ]]; then
        docker run -d --name $CONTAINER_NAME \
            $DOCKER_PORTS_MAPPING \
            gcr.io/cloudsql-docker/gce-proxy /cloud_sql_proxy \
            -instances=$INSTANCES
    elif [[ -z $GCP_APPLICATION_CREDENTIALS ]]; then
        echo 'Undefined "GCP_APPLICATION_CREDENTIALS"' >&2
        exit 1
    else
        docker run -d --name $CONTAINER_NAME \
            $DOCKER_PORTS_MAPPING \
            -v $GCP_APPLICATION_CREDENTIALS:/nonroot/config \
            -u root \
            gcr.io/cloudsql-docker/gce-proxy /cloud_sql_proxy \
            -instances=$INSTANCES \
            -credential_file=/nonroot/config
    fi

    echo "Waiting Cloud SQL Auth proxy..."
    sleep 4
    echo "Proxying \"${INSTANCES}\""
else
    echo "Unknown action \"$ACTION\"" >&2
    exit
fi
