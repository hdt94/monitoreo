# Databases configuration

Define enivronment variables:
```bash
export MONITOREO_ROOT=
export TERRAFORM_OUTPUT=$(terraform -chdir=$MONITOREO_ROOT/infrastructure/terraform output -json)
```

If using other than Cloud Shell:
```
export GCP_APPLICATION_CREDENTIALS=~/.config/gcloud/application_default_credentials.json
```
> Note: `GCP_APPLICATION_CREDENTIALS` is required to proxy Cloud SQL instances.

## `configs.template.json`

File describing configuration of Cloud SQL databases, including location of database schemas based on `MONITOREO_ROOT` environment variable.

> Notes:
> - `proxy_ports` values are used in Cloud SQL Auth Proxy so they must be unique within config file.


## `proxy-cloud-sql.sh`

Run Cloud SQL Auth proxy container:
```
./proxy-cloud-sql.sh run
```

`psql` into database of preference:
```bash
INSTANCE_NAME=
INSTANCE=$(echo $TERRAFORM_OUTPUT | jq ".databases_instances.value.\"$INSTANCE_NAME\"")
PGDATABASE=$(echo $INSTANCE | jq -r ".database")
PGPASSWORD=$(echo $INSTANCE | jq -r ".password")
PGUSER=$(echo $INSTANCE | jq -r ".user")
PGPORT=$(cat configs.template.json | jq -r ".[] | select(.database_instance == \"$INSTANCE_NAME\") | .proxy_port")

PGPASSWORD=$PGPASSWORD psql -h 127.0.0.1 -p $PGPORT -d $PGDATABASE -U $PGUSER
```

Remove Cloud SQL Auth proxy container:
```
./proxy-cloud-sql.sh remove
```

## insert-dataflow-templates.sh

Insert Cloud Dataflow Templates to analytics database based on `TERRAFORM_OUTPUT` and output from [build-templates.sh](/infrastructure/dataflow-templates/buidl-templates.sh)
