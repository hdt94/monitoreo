#!/bin/bash

set -e

if [[ -z $(which docker-compose) ]]; then
    sudo apt-get -qq update
    sudo apt-get -qq install -y ca-certificates gnupg jq lsb-release

    curl -fsSL https://download.docker.com/linux/ubuntu/gpg |
        sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
    echo \
        "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu \
    $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list >/dev/null
    sudo apt-get -qq update
    sudo apt-get -qq install -y docker-ce docker-ce-cli containerd.io

    sudo curl -sL "https://github.com/docker/compose/releases/download/1.29.2/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    sudo chmod +x /usr/local/bin/docker-compose
fi

APP_DIR=/app/

MISSING_APP_DIR=$(
    if [[ ! -d $APP_DIR ]] || [[ -z "$(ls $APP_DIR)" ]]; then
        echo true
    else
        echo false
    fi
)

if [[ $MISSING_APP_DIR = true ]]; then
    mkdir -p $APP_DIR
    git clone ${MONITOREO_REPO} $APP_DIR
fi

echo "Defining environment..."
COMPUTE_ENV=$(gcloud secrets versions access ${COMPUTE_SECRET_VERSION} --secret="${COMPUTE_SECRET_ID}")

# Load environment variables
export $(echo "$COMPUTE_ENV" | sed 's/#.*//g' | xargs)

if [[ -z $GCP_ANALYTICS_ENV_CLOUD_SECRET ]]; then
    echo "Undefined GCP_ANALYTICS_ENV_CLOUD_SECRET" >2 &
    exit 1
fi

export ANALYTICS_ENV="$(gcloud secrets versions access $GCP_ANALYTICS_ENV_CLOUD_SECRET)"

chmod +x $APP_DIR/services/setup-env.prot.sh
ENV_GCP_FROM_USER=true $APP_DIR/services/setup-env.prot.sh

echo "Starting services..."
docker-compose --env-file $APP_DIR/services/.env build -q
docker-compose --env-file $APP_DIR/services/.env pull -q
docker-compose --env-file $APP_DIR/services/.env up -d
