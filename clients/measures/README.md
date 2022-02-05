# Monitoreo - Cloud SDK client for measures

Define general variables:
```bash
MEASURES_STREAM_BUCKET=
STRUCTURE_ID=

GS_PREFIX="gs://$MEASURES_STREAM_BUCKET/${STRUCTURE_ID}"
```

Log in with `gcloud`: 
```bash
gcloud auth login
```
> Note: user account must have permissions for writing objects to bucket.

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
