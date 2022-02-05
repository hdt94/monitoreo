#!/bin/bash

set -e

DIR=$(dirname $0)
TEMPLATES=$1

if [[ -z $TEMPLATES ]]; then
    echo 'Undefined "TEMPLATES"' >&2
    exit 1
fi

if [[ -z $TERRAFORM_OUTPUT ]]; then
    echo 'Undefined "TERRAFORM_OUTPUT"' >&2
    exit 1
fi

DB=$($DIR/read-database-configs.sh | jq -c '.[] | select(.database_instance == "analytics-db-instance")')
NUM=$(echo $DB | wc -l)

if [[ $NUM != 1 ]]; then
    echo "Multiple analytics databases in config file" >&2
    exit 1
fi


templates_values() {
    for template in $(jq -c .[] /dev/stdin); do
        NAME=$(echo $template | jq -r .name)
        SPEC_PATH=$(echo $template | jq -r .container_spec_gcs_path)
        TYPES=$(echo $template | jq -r .execution_types[])
        VERSION=$(echo $template | jq -r .version)

        for type in $TYPES; do
            echo "('${NAME}', '${SPEC_PATH}', '${type}', '${VERSION}')"
        done
    done
}

# Run Cloud SQL Auth proxy container
$DIR/proxy-cloud-sql.sh run "[$DB]"

INSTANCE=$(echo $DB | jq -r .database_instance)
PORT=$(echo $DB | jq -r .proxy_port)

DATABASE=$(echo $TERRAFORM_OUTPUT | jq -r ".databases_instances.value.\"${INSTANCE}\".database")
USER=$(echo $TERRAFORM_OUTPUT | jq -r ".databases_instances.value.\"${INSTANCE}\".user")

export PGPASSWORD=$(echo $TERRAFORM_OUTPUT | jq -r ".databases_instances.value.\"${INSTANCE}\".password")

echo "Inserting Cloud Dataflow Templates records into analytics database..."
psql -q -h 127.0.0.1 -p $PORT -U $USER -d $DATABASE -c "
    INSERT INTO templates (name, container_spec_gcs_path, type, version)
    VALUES $(echo $TEMPLATES | templates_values | tr '\n' ',' | sed 's|,$|\n|')
"

# Stop and remove Cloud SQL Auth proxy container
$DIR/proxy-cloud-sql.sh remove
