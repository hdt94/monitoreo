# Databases configuration

Define enivronment variables:
```bash
export GCP_APPLICATION_CREDENTIALS=~/.config/gcloud/application_default_credentials.json
export MONITOREO_ROOT=
export TERRAFORM_OUTPUT=$(terraform -chdir=$MONITOREO_ROOT/infrastructure/terraform output -json)
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
TODO define parameters and password based on TERRAFORM_OUPUT
```bash
INSTANCE_NAME=
PARAMETERS=$(echo $TERRAFORM_OUPUT | jq '')
export PGPASSWORD=$(echo $TERRAFORM_OUPUT | jq '')
export PGPASSWORD=BlsJzrhjCe4tXp5yGGzepEI4O6hZbcJG
psql -h 127.0.0.1 -p 5432 -d analytics -U compute
```

Remove Cloud SQL Auth proxy container:
```
./proxy-cloud-sql.sh remove
```

## insert-dataflow-templates.sh

Insert Cloud Dataflow Templates to analytics database based on `TERRAFORM_OUTPUT` and output from [build-templates.sh](/infrastructure/dataflow-templates/buidl-templates.sh)
