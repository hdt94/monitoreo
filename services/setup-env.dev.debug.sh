#!/bin/bash

set -e

DIR=$(realpath $(dirname $0))


if [[ $ENV_GCP_EMPTY = true ]]; then
    GCP_APPLICATION_CREDENTIALS=""
else
    if [[ -z $GCP_APPLICATION_CREDENTIALS ]]; then
        GCP_APPLICATION_CREDENTIALS=~/.config/gcloud/application_default_credentials.json
    fi
    if [[ ! -f $GCP_APPLICATION_CREDENTIALS ]]; then
        echo "Invalid GCP_APPLICATION_CREDENTIALS: file not found: \"${GCP_APPLICATION_CREDENTIALS}\"" >&2
        exit 1
    fi
fi

ENV_GCP="$(
    ENV_GCP_EMPTY=$ENV_GCP_EMPTY \
    ENV_GCP_FROM_TERRAFORM=$ENV_GCP_FROM_TERRAFORM \
    ENV_GCP_FROM_USER=$ENV_GCP_FROM_USER \
    $DIR/echo-env-gcp.sh
)"
ENV_SERVICES="$($DIR/echo-env-services.sh)"

cat << EOF > $DIR/.env
GCP_APPLICATION_CREDENTIALS=${GCP_APPLICATION_CREDENTIALS}
${ENV_GCP}
${ENV_SERVICES}
MEASURES_FILES_STORAGE_MODE=${MEASURES_FILES_STORAGE_MODE:-local}
COMPOSE_FILE=\${PATH_SERVICE_PROXY}/docker-compose.common.yaml:\${PATH_SERVICE_PROXY}/docker-compose.dev.yaml:\${PATH_SERVICE_ANALYTICS}/docker-compose.common.yaml:\${PATH_SERVICE_ANALYTICS}/docker-compose.dev.yaml:\${PATH_SERVICE_ANALYTICS}/docker-compose.debug.yaml:\${PATH_SERVICE_GRAFANA}/docker-compose.common.yaml:\${PATH_SERVICE_GRAFANA}/docker-compose.dev.yaml:\${PATH_SERVICE_LIVE}/docker-compose.common.yaml:\${PATH_SERVICE_LIVE}/docker-compose.dev.yaml:\${PATH_SERVICE_LIVE}/docker-compose.debug.yaml:\${PATH_SERVICE_REGISTRY}/docker-compose.common.yaml:\${PATH_SERVICE_REGISTRY}/docker-compose.dev.yaml:\${PATH_SERVICE_REGISTRY}/docker-compose.debug.yaml:\${PATH_SERVICE_USERS}/docker-compose.common.yaml:\${PATH_SERVICE_USERS}/docker-compose.dev.yaml:\${PATH_SERVICE_USERS}/docker-compose.debug.yaml
EOF
