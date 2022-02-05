# Monitoreo - services

This guide indicates how to lift up services with Docker-Compose for developing, debugging, and prototyping.

> **DISCLAIMER**: currently there is no validation nor sanitation of payload from requests to services beyond some simple checks and conversions such as MongoDB ObjectId. This is not meant for actual production.

## Up and running

### Using Docker-Compose

> **DISCLAIMER**: configurations of Docker-Compose along with services used here should be used only for development or prototyping, **NOT ACTUAL PRODUCTION**.


#### `services.config.json`

Configuration of services regarding ports.

> Notes:
> - any change to `port` fields should be replicated to [proxy/nginx.conf](proxy/nginx.conf).
> - none of the values in `port_host` and `port_host_debug` can collide. These ports are used only for development and debugging.

#### Local development and debugging

Login to GCP from local if using Cloud Storage and/or Cloud Dataflow:
```bash
gcloud auth application-default login
```

Setup `.env` file for development and debugging with either of following options:
```bash
chmod +x ./*.sh

# Local setup emptying GCP-related environment variables
ENV_GCP_EMPTY=true ./setup-env.dev.debug.sh

# Local setup reading GCP-related environment variables from Terraform output
ENV_GCP_FROM_TERRAFORM=true ./setup-env.dev.debug.sh

# Local setup reading GCP-related environment variables from user definitions
export GCP_ANALYTICS_ENV_CLOUD_SECRET=
export GCP_LOCATION=
export GCP_PROJECT_ID=
export GCP_PUBSUB_TOPIC_STREAM=
export GS_BUCKET_MEASURES_BATCH=
ENV_GCP_FROM_USER=true ./setup-env.dev.debug.sh
```

Additional environment variables in local to modify `.env`:
```bash
export GCP_APPLICATION_CREDENTIALS=  # defaults to "~/.config/gcloud/application_default_credentials.json"
export MEASURES_FILES_STORAGE_MODE=gs  # "local" or "gs"; defaults to "local"
```

Run services:
```bash
docker-compose up --build
```

Insert records of Cloud Dataflow Flex Templates following instructions in [analytics/README.md](./analytics/README.md)

#### Prototyping in GCP

Define environment:
```bash
export GCP_ANALYTICS_ENV_CLOUD_SECRET=
export GCP_LOCATION=
export GCP_PROJECT_ID=
export GCP_PUBSUB_TOPIC_STREAM=
export GS_BUCKET_MEASURES_BATCH=
ENV_GCP_FROM_USER=true ./setup-env.prot.sh
```

Run services:
```bash
docker-compose up --build
```

#### Links of interest

Previous usage of services paths as environment variables along with `COMPOSE_FILE` environment variable is a workaround to run services with independent contexts of volumes using docker-compose files. See following links for more details:
- [https://docs.docker.com/compose/reference/envvars/#compose_file/](https://docs.docker.com/compose/reference/envvars/#compose_file/)
- [https://docs.docker.com/compose/extends/](https://docs.docker.com/compose/extends/)
- [https://github.com/docker/compose/issues/3874](https://github.com/docker/compose/issues/3874)
- [https://github.com/kmturley/docker-compose-microservices](https://github.com/kmturley/docker-compose-microservices)
