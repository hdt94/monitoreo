# Monitoreo - analytics service

## Description

TODO describe "execution" abstraction

All execution submission messages and jobs have an `execution_id`.

### Notes

- Cloud Dataflow Flex Templates supporting both batch and stream processing must be stored in analytics database as independent records for each type of processing. Insert records using the same container specification path but changing the type of processing as shown in further example.
- It's possible that this service sends jobs with `executionId` and `templateId` equal to `null` if Cloud Dataflow instance is accessed from other client than this analytics service, for example, data scientists running pipelines from shell.

## Up and running

### Local

Login to GCP from local if using Cloud Dataflow:
```bash
gcloud auth application-default login
```

Define environment variables required in Docker-Compose manifests. See [services README](../README.md) for more details.

Local development:
```bash
docker-compose \
    -f docker-compose.common.yaml \
    -f docker-compose.dev.yaml \
    up
```

Local debugging:
```bash
docker-compose \
    -f docker-compose.common.yaml \
    -f docker-compose.dev.yaml \
    -f docker-compose.debug.yaml \
    up
```

> Note: any configuration change to "analytics_db" database service in development must be replicated in configuration of "grafana" service as the former is used as datasource in the latter.

#### Dataflow templates

> Note: records of Cloud Dataflow Flex Templates are created in Cloud SQL instance as part of cloud environment initialization. This following instructions are only for local.

Define environment variables related to database:
```bash
export PGDATABASE=analytics
export PGHOST=
export PGPASSWORD=
export PGPORT=
export PGUSER=
```

Example for local environment:
```bash
export PGDATABASE=analytics
export PGHOST=127.0.0.1
export PGPASSWORD=postgres
export PGPORT=5434
export PGUSER=postgres
```
> Note: change port according to [docker-compose.debug.yaml](docker-compose.debug.yaml)

Insert registers of Dataflow Templates:
```bash
psql -c "
    INSERT INTO templates (name, container_spec_gcs_path, type, version)
    VALUES
        ('basic-template', 'gs://qwiklabs-gcp/dataflow/templates/modal.json', 'batch', 'v20221023'),
        ('basic-template', 'gs://qwiklabs-gcp/dataflow/templates/modal.json', 'stream', 'v20221023');
"
```


### Cloud (prototyping only)

Prototyping:
```bash
docker-compose \
    -f docker-compose.common.yaml \
    -f docker-compose.prot.yaml \
    up
```

