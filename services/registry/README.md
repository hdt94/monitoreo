# Monitoreo - registry service

## Description

Support for two modes of storage: `local` or `gs` (Cloud Google Storage).

> Note: [docker-compose.common.yaml](./docker-compose.common.yaml) defines local database service for both development and prototyping as no cloud service is being used for the latter.

TODO use postgresql as mongodb doesn't have referential integrity (leads to inconsistencies when deleting resources)
TEMP Usage of `$lookup` in [`src/db/lookups.js`](src/db/lookups.js) should be temporary to "provide relational querying"

## Up and running

Login to GCP from local if using Cloud Storage:
```bash
gcloud auth application-default login
```

Define environment variables required in Docker-Compose manifests. See [services README](../README.md) for more details.

### Development

Use Docker-Compose commands as needed from service containing folder:
```bash
docker-compose -f docker-compose.common.yaml -f docker-compose.dev.yaml build 
docker-compose -f docker-compose.common.yaml -f docker-compose.dev.yaml up 
docker-compose -f docker-compose.common.yaml -f docker-compose.dev.yaml down 
docker-compose -f docker-compose.common.yaml -f docker-compose.dev.yaml down --volumes
```

### Debugging

Run Docker-Compose commands as needed:
```bash
docker-compose -f docker-compose.common.yaml -f docker-compose.dev.yaml -f docker-compose.debug.yaml build
docker-compose -f docker-compose.common.yaml -f docker-compose.dev.yaml -f docker-compose.debug.yaml up
docker-compose -f docker-compose.common.yaml -f docker-compose.dev.yaml -f docker-compose.debug.yaml down
docker-compose -f docker-compose.common.yaml -f docker-compose.dev.yaml -f docker-compose.debug.yaml down --volumes
```
