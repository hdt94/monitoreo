#!/bin/bash

set -e

if [[ -z MONITOREO_REPO ]]; then
    echo 'Undefined "MONITOREO_REPO"' >&2
    exit 1
fi
if [[ -z GCP_APPLICATION_CREDENTIALS ]]; then
    echo 'Undefined "GCP_APPLICATION_CREDENTIALS"' >&2
    exit 1
fi
if [[ -z GCP_LOCATION ]]; then
    echo 'Undefined "GCP_LOCATION"' >&2
    exit 1
fi
if [[ -z GCP_PROJECT_ID ]]; then
    echo 'Undefined "GCP_PROJECT_ID"' >&2
    exit 1
fi

if [[ $RUN_ALL = true ]]; then
    RUN_TERRAFORM=true
    CREATE_DB_SCHEMAS=true
    BUILD_DATAFLOW_TEMPLATES=true
else
    if [[ -z $RUN_TERRAFORM ]]; then
        RUN_TERRAFORM=false
    fi
    if [[ -z $CREATE_DB_SCHEMAS ]]; then
        CREATE_DB_SCHEMAS=false
    fi
    if [[ -z $BUILD_DATAFLOW_TEMPLATES ]]; then
        BUILD_DATAFLOW_TEMPLATES=false
    fi
fi

export MONITOREO_ROOT=$(realpath $(dirname $0))

# Provisioning
TERRAFORM_DIR=$MONITOREO_ROOT/infrastructure/terraform

if [[ $RUN_TERRAFORM = true ]]; then
    terraform -chdir=$TERRAFORM_DIR init
    terraform -chdir=$TERRAFORM_DIR apply \
        -var MONITOREO_REPO=$MONITOREO_REPO \
        -var PROJECT_ID=$GCP_PROJECT_ID \
        -var REGION=$GCP_LOCATION \
        -var ZONE=${GCP_LOCATION}-a
fi

export TERRAFORM_OUTPUT=$(terraform -chdir=$TERRAFORM_DIR output -json)
echo -e "TERRAFORM_OUTPUT:\n${TERRAFORM_OUTPUT}"

# Databases
if [[ $CREATE_DB_SCHEMAS = true ]]; then
    echo "Setting up databases..."
    DATABASES_CONFIG_DIR=$MONITOREO_ROOT/infrastructure/databases
    chmod +x $DATABASES_CONFIG_DIR/*.sh
    $DATABASES_CONFIG_DIR/init-cloud-sql.sh
fi

# Dataflow templates
if [[ $BUILD_DATAFLOW_TEMPLATES = true ]]; then
    echo "Building Cloud Dataflow Flex Templates..."
    DATAFLOW_CONFIG_DIR=$MONITOREO_ROOT/infrastructure/dataflow-templates
    chmod +x $DATAFLOW_CONFIG_DIR/build-templates.sh
    BUILDER=cloudbuild $DATAFLOW_CONFIG_DIR/build-templates.sh
fi