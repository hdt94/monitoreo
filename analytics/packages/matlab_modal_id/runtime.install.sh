#!/bin/bash

set -e

DIR=$(dirname $(realpath $0))

INSTALLATION_DIR=$1
INSTALLER_OPT=$2

INSTALLER=$DIR/runtime_installer.zip
INPUT_FILE=$DIR/installer_input.txt
TEMP_FILES_DIR=/tmp/matlab_runtime_files

if [[ -z $INSTALLATION_DIR ]]; then
    echo "Installation directory not defined" >&2
    exit 1
elif [[ ! -d $INSTALLATION_DIR ]]; then
    mkdir -p $INSTALLATION_DIR
fi

if [[ ! -f $INSTALLER ]]; then
    echo "Missing runtime installer" >&2
    exit 1
elif [[ ! -f $INPUT_FILE ]]; then
    echo "Missing input file" >&2
    exit 1
fi

echo "Unzipping installer..."
unzip -qq $INSTALLER -d $TEMP_FILES_DIR

# Remove installer to reduce disk space in container images
if [[ ! -z $INSTALLER_OPT && $INSTALLER_OPT == "--remove-installer" ]]; then
    echo "Removing installer..."
    rm $INSTALLER
fi

$TEMP_FILES_DIR/install -destinationFolder $INSTALLATION_DIR -inputFile $INPUT_FILE
rm -r $TEMP_FILES_DIR
