# Monitoreo - Cloud SDK client for measures

Log in with `gcloud`:
```bash
gcloud auth login
```
> Note: user account must have permissions for writing objects to bucket.

## `upload.sh`

Define general variables:
```bash
export MEASURES_STREAM_BUCKET=
export STRUCTURE_ID=

chmod +x upload.sh

# Upload file
./upload.sh /data/221800000_0002BF20

# Upload directory
./upload.sh /data/

# Interactively upload files from a directory
INTERACTIVE=true ./upload.sh /data/
```

## Manual upload

Define general variables:
```bash
MEASURES_STREAM_BUCKET=
STRUCTURE_ID=

GS_PREFIX="gs://$MEASURES_STREAM_BUCKET/${STRUCTURE_ID}"
```

Upload file to bucket:
```bash
UPLOAD_FILE=
GS_OBJECT="$GS_PREFIX/$(basename $UPLOAD_FILE)"
gsutil -h x-goog-meta-structure_id:${STRUCTURE_ID} cp "$UPLOAD_FILE" "$GS_OBJECT"
```

Upload directory to bucket:
```bash
UPLOAD_DIR=
gsutil -h x-goog-meta-structure_id:${STRUCTURE_ID} cp -r "$UPLOAD_DIR" "$GS_PREFIX"
```
