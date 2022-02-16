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

export MONITOREO_ROOT=/app/

MISSING_MONITOREO_ROOT=$(
    if [[ ! -d $MONITOREO_ROOT ]] || [[ -z "$(ls $MONITOREO_ROOT)" ]]; then
        echo true
    else
        echo false
    fi
)

if [[ $MISSING_MONITOREO_ROOT = true ]]; then
    mkdir -p $MONITOREO_ROOT
    git clone ${MONITOREO_REPO} $MONITOREO_ROOT
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

export GCP_IDENTITY_PLATFORM_API_KEY=${IDENTITY_PLATFORM_API_KEY}
export GCP_IDENTITY_PLATFORM_AUTH_DOMAIN=${IDENTITY_PLATFORM_AUTH_DOMAIN}

chmod +x $MONITOREO_ROOT/services/setup-env.prot.sh
ENV_GCP_FROM_USER=true $MONITOREO_ROOT/services/setup-env.prot.sh

echo "Starting services..."
docker-compose --env-file $MONITOREO_ROOT/services/.env build -q
docker-compose --env-file $MONITOREO_ROOT/services/.env pull -q
docker-compose --env-file $MONITOREO_ROOT/services/.env up -d
