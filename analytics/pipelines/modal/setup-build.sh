#!/bin/bash

set -e

DIR=$(realpath $(dirname $0))

LOCAL_PACKAGES=$(<$DIR/requirements.local.txt)
EXTRA_PACKAGES_DIR=$DIR/extra_packages

if [[ -z $MONITOREO_ROOT ]]; then
    echo 'Undefined "MONITOREO_ROOT"' >&2
    exit 1
fi

echo "Setting up directory for build..."

EXTRA_PACKAGES_DIR_CHILDREN=$(find $EXTRA_PACKAGES_DIR/* -maxdepth 0 -type d)
if [[ ! -z $EXTRA_PACKAGES_DIR_CHILDREN ]]; then
    echo "Removing current extra packages..."
    rm -r $EXTRA_PACKAGES_DIR_CHILDREN
fi

for package in $LOCAL_PACKAGES; do
    echo "Copying \"$package\"..."
    LOCAL_PACKAGE_DIR=$MONITOREO_ROOT/analytics/packages/$package
    cp -r $LOCAL_PACKAGE_DIR $EXTRA_PACKAGES_DIR
done
