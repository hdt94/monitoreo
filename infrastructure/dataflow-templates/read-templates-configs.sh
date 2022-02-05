#!/bin/bash

set -e

DIR=$(dirname $0)

if [[ -z $MONITOREO_ROOT ]]; then
    echo 'Undefined "MONITOREO_ROOT"' >&2
    exit 1
fi

echo $(sed -e "s|\${MONITOREO_ROOT}|$MONITOREO_ROOT|g" $DIR/configs.template.json)
