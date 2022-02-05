#!/bin/bash

set -e

DIR=$(realpath $(dirname $0))

if [[ -z $URL ]]; then
    echo "Undefined URL" >&2
    exit 1
elif [[ -z $ANALYTICS_DB_HOST ]]; then
    echo "Undefined ANALYTICS_DB_HOST" >&2
    exit 1
elif [[ -z $ANALYTICS_DB_PASSWORD ]]; then
    echo "Undefined ANALYTICS_DB_PASSWORD" >&2
    exit 1
elif [[ -z $ANALYTICS_DB_PORT ]]; then
    echo "Undefined ANALYTICS_DB_PORT" >&2
    exit 1
elif [[ -z $ANALYTICS_DB_USER ]]; then
    echo "Undefined ANALYTICS_DB_USER" >&2
    exit 1
fi

echo "Creating public organization..."
ORG_ID=$(curl -s ${URL}/api/orgs -X POST -H "Content-Type: application/json" -d '{"name":"public"}' | jq -r '.orgId')
if [[ ORG_ID -ne 2 ]]; then
    echo "Public org id is expected to be \"2\" instead of \"${ORG_ID}\"" >&2
    exit 1
fi

echo "Creating PostgreSQL-like data source..."
DATASOURCE_CONFIG=$(
    cat $DIR/templates/analytics.data_source.json.template \
    | sed -e "s|\${ANALYTICS_DB_HOST}|$ANALYTICS_DB_HOST|g" \
    | sed -e "s|\${ANALYTICS_DB_PASSWORD}|$ANALYTICS_DB_PASSWORD|g" \
    | sed -e "s|\${ANALYTICS_DB_PORT}|$ANALYTICS_DB_PORT|g" \
    | sed -e "s|\${ANALYTICS_DB_USER}|$ANALYTICS_DB_USER|g"
)
curl -s -X POST \
    -H "X-Grafana-Org-Id: ${ORG_ID}" \
    -H "Content-Type: application/json" \
    -d "${DATASOURCE_CONFIG}" \
    ${URL}/api/datasources \
    > /dev/null

# for file in $DIR/dashboards/base/*; do
for file in /var/lib/grafana/dashboards/base/*; do
    echo "Creating dashboard \"${file}\"..."
    curl -s -X POST \
        -H "X-Grafana-Org-Id: ${ORG_ID}" \
        -H "Content-Type: application/json" \
        -d '{"dashboard":'"$(cat $file | jq -c '.')"'}' \
        ${URL}/api/dashboards/db \
        > /dev/null
done

# Manual verification
# curl -s ${URL}/api/dashboards
