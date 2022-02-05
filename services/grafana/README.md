# Monitoreo - Grafana service

## Up and running

In development:
```bash
docker-compose -f docker-compose.common.yaml -f docker-compose.dev.yaml build
docker-compose -f docker-compose.common.yaml -f docker-compose.dev.yaml up
```

In prototyping:
```bash
docker-compose -f docker-compose.common.yaml -f docker-compose.prot.yaml build
docker-compose -f docker-compose.common.yaml -f docker-compose.prot.yaml up
```

### `entrypoint.sh`

As Grafana distribution with Docker has no way of provisioning organizations, I coded a script that runs default container entrypoint and then initializes one public organization along with their corresponding datasources and dashboards.

### `init-public.sh`

> Note: this is run by container entrypoint.

Define variables related to analytics PostgreSQL-like datasource:

```bash
export ANALYTICS_DB_HOST=
export ANALYTICS_DB_PASSWORD=
export ANALYTICS_DB_PORT=
export ANALYTICS_DB_USER=
```

Then run script:

```bash
URL=http://admin:${GRAFANA_ADMIN_PASSWORD}@localhost:3000 ./init-public.sh
```

> Note: the public organization is expected to have identifier `orgId=2` as this allows webapp to make requests with no auth required, considering searching `orgId` based on organization name "public" requires auth, so it would be necessary to create an intermediary service between webapp and Grafana.
