#!/bin/bash

set -e

DIR=$(realpath $(dirname $0))


ENV_GCP="$(ENV_GCP_FROM_USER=true  $DIR/echo-env-gcp.sh)"
ENV_SERVICES="$($DIR/echo-env-services.sh)"

cat << EOF > $DIR/.env
${ENV_GCP}
${ENV_SERVICES}
GRAFANA_ADMIN_PASSWORD=${GRAFANA_ADMIN_PASSWORD}
HOST_DOMAIN=${HOST_DOMAIN}
MEASURES_FILES_STORAGE_MODE=${MEASURES_FILES_STORAGE_MODE:-gs}
COMPOSE_FILE=\${PATH_SERVICE_PROXY}/docker-compose.common.yaml:\${PATH_SERVICE_PROXY}/docker-compose.prot.yaml:\${PATH_SERVICE_ANALYTICS}/docker-compose.common.yaml:\${PATH_SERVICE_ANALYTICS}/docker-compose.prot.yaml:\${PATH_SERVICE_GRAFANA}/docker-compose.common.yaml:\${PATH_SERVICE_GRAFANA}/docker-compose.prot.yaml:\${PATH_SERVICE_LIVE}/docker-compose.common.yaml:\${PATH_SERVICE_LIVE}/docker-compose.prot.yaml:\${PATH_SERVICE_REGISTRY}/docker-compose.common.yaml:\${PATH_SERVICE_REGISTRY}/docker-compose.prot.yaml
EOF
