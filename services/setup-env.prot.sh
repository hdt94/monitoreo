#!/bin/bash

set -e

DIR=$(realpath $(dirname $0))


ENV_GCP="$(ENV_GCP_FROM_USER=true  $DIR/echo-env-gcp.sh)"
ENV_SERVICES="$($DIR/echo-env-services.sh)"

if [[ -z $ANALYTICS_ENV ]]; then
    echo "Undefined ANALYTICS_ENV" >2&
    exit
fi

parse_env_analytics_datasource() {
    echo "
ANALYTICS_DB_HOST=$(echo "$ANALYTICS_ENV" | grep -oP '(?<='PGHOST=').*')
ANALYTICS_DB_PASSWORD=$(echo "$ANALYTICS_ENV" | grep -oP '(?<='PGPASSWORD=').*')
ANALYTICS_DB_PORT=$(echo "$ANALYTICS_ENV" | grep -oP '(?<='PGPORT=').*')
ANALYTICS_DB_USER=$(echo "$ANALYTICS_ENV" | grep -oP '(?<='PGUSER=').*')
"
}

cat << EOF > $DIR/.env
${ENV_GCP}
${ENV_SERVICES}
$(parse_env_analytics_datasource)
GRAFANA_ADMIN_PASSWORD=${GRAFANA_ADMIN_PASSWORD}
HOST_DOMAIN=${HOST_DOMAIN}
MEASURES_FILES_STORAGE_MODE=${MEASURES_FILES_STORAGE_MODE:-gs}
COMPOSE_FILE=\${PATH_SERVICE_PROXY}/docker-compose.common.yaml:\${PATH_SERVICE_PROXY}/docker-compose.prot.yaml:\${PATH_SERVICE_ANALYTICS}/docker-compose.common.yaml:\${PATH_SERVICE_ANALYTICS}/docker-compose.prot.yaml:\${PATH_SERVICE_GRAFANA}/docker-compose.common.yaml:\${PATH_SERVICE_GRAFANA}/docker-compose.prot.yaml:\${PATH_SERVICE_LIVE}/docker-compose.common.yaml:\${PATH_SERVICE_LIVE}/docker-compose.prot.yaml:\${PATH_SERVICE_REGISTRY}/docker-compose.common.yaml:\${PATH_SERVICE_REGISTRY}/docker-compose.prot.yaml
EOF
