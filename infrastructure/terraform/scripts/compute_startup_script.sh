#!/bin/bash

set -e

if [[ -z $(which docker-compose) ]]; then
    sudo apt-get -qq update
    sudo apt-get -qq install -y ca-certificates gnupg jq lsb-release

    curl -fsSL https://download.docker.com/linux/ubuntu/gpg \
        | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
    echo \
    "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu \
    $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
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

COMPUTE_ENV=$(gcloud secrets versions access ${COMPUTE_SECRET_VERSION} --secret="${COMPUTE_SECRET_ID}")

# Load environment variables
export $(echo "$COMPUTE_ENV" | sed 's/#.*//g' | xargs)

chmod +x $APP_DIR/services/setup-env.prot.sh
ENV_GCP_FROM_USER=true $APP_DIR/services/setup-env.prot.sh

sudo docker-compose -d --env-file services/.env up --build
