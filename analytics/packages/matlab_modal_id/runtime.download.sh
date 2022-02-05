#!/bin/bash

if [[ -z $1 ]]; then
    DIR=$(realpath $(dirname $0))
else
    DIR=$(realpath $1)
fi
LOCAL_INSTALLER_PATH=$DIR/runtime_installer.zip

COPY_FROM_GS=false
COPY_TO_GS=false

GS_BUCKET_URL=$2
GS_INSTALLER_PATH=${GS_BUCKET_URL}/matlab2021a/runtime_installer.zip
if [[ ! -z $GS_BUCKET_URL ]] || [[ $GS_BUCKET_URL == gs* ]]; then
    gsutil -q ls $GS_INSTALLER_PATH >/dev/null 2>&1
    if [ $? == 0 ]; then
        COPY_FROM_GS=true
    else
        COPY_TO_GS=true
    fi
fi

set -e

if [[ $COPY_FROM_GS == true ]]; then
    echo "Copying MATLAB Runtime installer from Cloud Storage..."
    echo "Origin: ${GS_INSTALLER_PATH}"
    echo "Destination: ${LOCAL_INSTALLER_PATH}"
    gsutil -q cp $GS_INSTALLER_PATH $LOCAL_INSTALLER_PATH
else
    HTTP_URL=https://ssd.mathworks.com/supportfiles/downloads/R2021a/Release/5/deployment_files/installer/complete/glnxa64/MATLAB_Runtime_R2021a_Update_5_glnxa64.zip

    echo "Downloading MATLAB Runtime installer from Mathworks..."
    echo "Origin: ${HTTP_URL}"
    echo "Destination: ${LOCAL_INSTALLER_PATH}"
    curl -sLo $LOCAL_INSTALLER_PATH $HTTP_URL

    if [[ $COPY_TO_GS == true ]]; then
        echo "Copying MATLAB Runtime installer to Cloud Storage..."
        echo "Origin: ${LOCAL_INSTALLER_PATH}"
        echo "Destination: ${GS_INSTALLER_PATH}"
        gsutil -q cp $LOCAL_INSTALLER_PATH $GS_INSTALLER_PATH
    fi
fi
