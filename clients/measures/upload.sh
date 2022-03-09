#!/bin/bash

set -e

INPUT=$(realpath $1)

if [[ -z $MEASURES_STREAM_BUCKET ]]; then 
    echo "Undefined MEASURES_STREAM_BUCKET" >&2
    exit 1
fi
if [[ -z $STRUCTURE_ID ]]; then 
    echo "Undefined STRUCTURE_ID" >&2
    exit 1
fi


GS_PREFIX="gs://$MEASURES_STREAM_BUCKET/${STRUCTURE_ID}"

upload_directory() {
    DIR=$1

    gsutil -h x-goog-meta-structure_id:${STRUCTURE_ID} cp -r "$DIR" "$GS_PREFIX"
}

upload_file() {
    FILE=$1
    GS_OBJECT="$GS_PREFIX/$(basename $FILE)"

    gsutil -h x-goog-meta-structure_id:${STRUCTURE_ID} cp "$FILE" "$GS_OBJECT"
}


if [[ -f $INPUT ]]; then
    upload_file $INPUT
    exit 0;
fi

if [[ ! -d $INPUT ]]; then
    echo "Invalid input \"$INPUT\"" >&2
    exit 2;
fi

if [[ -z $INTERACTIVE ]]; then 
    INTERACTIVE=false
fi

if [[ $INTERACTIVE == "true" ]]; then
    for file in $(find $INPUT -type f | sort -n); do
        read -p "Upload \"$file\"? (y): "
        if [[ $REPLY == [yY] ]]; then
            upload_file $file
        fi
    done
else
    upload_directory $INPUT
fi
