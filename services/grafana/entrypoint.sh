#!/bin/bash

DIR=$(realpath $(dirname $0))

BASE_URL=localhost:${PORT_SERVICE_GRAFANA:-3000}
AUTH_BASE_URL=admin:${GF_SECURITY_ADMIN_PASSWORD}@${BASE_URL}

echo "Starting Grafana..."
/run.sh &

curl -s \
    --retry 20 \
    --retry-all-errors \
    --retry-delay 5 \
    "${BASE_URL}/api/health" \
    >/dev/null

if [[ $? ]]; then
    MISSING_PUBLIC_ORG="$(curl -s $AUTH_BASE_URL/api/orgs/name/public | grep 'not found')"
    if [[ "$MISSING_PUBLIC_ORG" ]]; then
        URL=${AUTH_BASE_URL} $DIR/init-public.sh
    else 
        echo "Public organization already created"
    fi
    wait
else
    echo "Grafana failed to start :("
fi
