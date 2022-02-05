#!/bin/bash

set -e

# INSTANCE_CONNECTION_NAME=$(gcloud sql instances describe INSTANCE_NAME)
# DATABASE_PRIVATE_IP=$(echo $TERRAFORM_OUTPUT | jq .database_private_ip_address.value -r)

DIR=$(dirname $0)
CONFIGS=$($DIR/read-database-configs.sh)

if [[ -z $TERRAFORM_OUTPUT ]]; then
    echo 'Undefined "TERRAFORM_OUTPUT"' >&2
    exit 1
fi

echo "Initializing Cloud SQL databases..."

# Run Cloud SQL Auth proxy container
$DIR/proxy-cloud-sql.sh run

# Initializing schemas
for config in $(echo $CONFIGS | jq -c .[]); do
    INSTANCE=$(echo $config | jq -r .database_instance)
    LOCATION=$(echo $config | jq -r .init_location)
    PORT=$(echo $config | jq -r .proxy_port)

    DATABASE=$(echo $TERRAFORM_OUTPUT | jq -r ".databases_instances.value.\"${INSTANCE}\".database")
    USER=$(echo $TERRAFORM_OUTPUT | jq -r ".databases_instances.value.\"${INSTANCE}\".user")

    echo "Initializng \"${INSTANCE}\"..."
    export PGPASSWORD=$(echo $TERRAFORM_OUTPUT | jq -r ".databases_instances.value.\"${INSTANCE}\".password")
    # for sql_file in $LOCATION/*.sql; do
    for sql_file in $(find $LOCATION -type f -name *.sql); do
    # for sql_file in /home/vagrant/labs/monitoreo/services/analytics/initdb.d/110-data.sql /home/vagrant/labs/monitoreo/services/analytics/initdb.d/101-jobs-templates.sql; do
        echo $sql_file
        psql -q -h 127.0.0.1 -p $PORT -U $USER -d $DATABASE -f $sql_file
    done
done

# Stop and remove Cloud SQL Auth proxy container
$DIR/proxy-cloud-sql.sh remove
