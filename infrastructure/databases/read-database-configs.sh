#!/bin/bash

set -e

if [[ -z $MONITOREO_ROOT ]]; then
    echo 'Undefined "MONITOREO_ROOT"' >&2
    exit 1
fi

DIR=$(dirname $0)

echo $(sed -e "s|\${MONITOREO_ROOT}|$MONITOREO_ROOT|g" $DIR/configs.template.json)
