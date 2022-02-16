#!/bin/bash

set -e

env_empty() {
    echo 'GCP_ANALYTICS_ENV_CLOUD_SECRET=""
GCP_LOCATION=""
GCP_PROJECT_ID=""
GCP_PUBSUB_TOPIC_STREAM=""
GS_BUCKET_MEASURES_BATCH=""
'
}

env_from_terraform() {
    if [[ -z $TERRAFORM_OUTPUT ]]; then
        echo "Undefined TERRAFORM_OUTPUT" >&2
        exit 1
    fi

    TF=$TERRAFORM_OUTPUT
    DT=$(jq '.dataflow.value' <<<$TERRAFORM_OUTPUT)

    echo "GCP_ANALYTICS_ENV_CLOUD_SECRET=$(jq -r '.GCP_DATAFLOW_ENV_SECRET' <<<$DT)
GCP_LOCATION=$(jq -r '.location.value' <<<$TF)
GCP_PROJECT_ID=$(jq -r '.project_id.value' <<<$TF)
GCP_PUBSUB_TOPIC_STREAM=$(jq -r '.pubsub_topic_stream.value' <<<$TF)
GS_BUCKET_MEASURES_BATCH=gs://$(jq -r '.gs_bucket_measures_batch.value' <<<$TF)
"
}

env_from_user() {
    if [[ -z $GCP_ANALYTICS_ENV_CLOUD_SECRET ]]; then
        echo "Undefined GCP_ANALYTICS_ENV_CLOUD_SECRET" >&2
        exit 1
    elif [[ -z $GCP_IDENTITY_PLATFORM_API_KEY ]]; then
        echo "Undefined GCP_IDENTITY_PLATFORM_API_KEY" >&2
        exit 1
    elif [[ -z $GCP_IDENTITY_PLATFORM_AUTH_DOMAIN ]]; then
        echo "Undefined GCP_IDENTITY_PLATFORM_AUTH_DOMAIN" >&2
        exit 1
    elif [[ -z $GCP_LOCATION ]]; then
        echo "Undefined GCP_LOCATION" >&2
        exit 1
    elif [[ -z $GCP_PROJECT_ID ]]; then
        echo "Undefined GCP_PROJECT_ID" >&2
        exit 1
    elif [[ -z $GCP_PUBSUB_TOPIC_STREAM ]]; then
        echo "Undefined GCP_PUBSUB_TOPIC_STREAM" >&2
        exit 1
    elif [[ -z $GS_BUCKET_MEASURES_BATCH ]]; then
        echo "Undefined GS_BUCKET_MEASURES_BATCH" >&2
        exit 1
    fi

    echo "GCP_ANALYTICS_ENV_CLOUD_SECRET=$GCP_ANALYTICS_ENV_CLOUD_SECRET
GCP_IDENTITY_PLATFORM_API_KEY=$GCP_IDENTITY_PLATFORM_API_KEY
GCP_IDENTITY_PLATFORM_AUTH_DOMAIN=$GCP_IDENTITY_PLATFORM_AUTH_DOMAIN
GCP_LOCATION=$GCP_LOCATION
GCP_PROJECT_ID=$GCP_PROJECT_ID
GCP_PUBSUB_TOPIC_STREAM=$GCP_PUBSUB_TOPIC_STREAM
GS_BUCKET_MEASURES_BATCH=$GS_BUCKET_MEASURES_BATCH
"
}

if [[ $ENV_GCP_EMPTY = 'true' ]]; then
    ENV_GCP="$(env_empty)"
elif [[ $ENV_GCP_FROM_TERRAFORM = 'true' ]]; then
    ENV_GCP="$(env_from_terraform)"
elif [[ $ENV_GCP_FROM_USER = 'true' ]]; then
    ENV_GCP="$(env_from_user)"
else
    echo "Invalid input for defining GCP env" >&2
    exit 1
fi

echo "$ENV_GCP"
