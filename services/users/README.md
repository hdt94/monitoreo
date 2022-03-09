# Monitoreo - users service

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

### Cloud (prototyping only)

Prototyping:
```bash
docker-compose \
    -f docker-compose.common.yaml \
    -f docker-compose.prot.yaml \
    up
```
