#!/bin/bash

set -e

CURRENT=$PWD
DIR=$(dirname $(realpath $0))

INSTALLATION_DIR=$1
INSTALLATION_OPT=$2

INSTALLATION_ZIP=$DIR/runtime_installation.zip

if [[ -z $INSTALLATION_DIR ]]; then
    echo "Installation directory not defined" >&2
    exit 1
elif [[ ! -d $INSTALLATION_DIR ]]; then
    echo "Invalid installation directory \"${INSTALLATION_DIR}\"" >&2
    exit 1
fi

echo "Zipping installation..."
cd $INSTALLATION_DIR # avoid copying entire directory path from root within `.zip` file
zip -qr0 $INSTALLATION_ZIP ./*

# zip -qr0 file.zip ./*
# mv $INSTALLATION_DIR/file.zip $INSTALLATION_ZIP

# Remove installation to reduce disk space in container images
if [[ ! -z $INSTALLATION_OPT && $INSTALLATION_OPT == "--remove-installation" ]]; then
    echo "Removing installation..."
    rm -r $INSTALLATION_DIR/*
fi

# `cd $MCR` to avoid copying entire $MCR directory structure within `.zip` file
# && cd $MCR && zip -qr0 file.zip ./* && cd $EXTRA_PACKAGES_BEAM_DIR \
# && mv $MCR/file.zip $RUNTIME_INSTALLATION \
# && rm -r $MCR/* \

cd $CURRENT
