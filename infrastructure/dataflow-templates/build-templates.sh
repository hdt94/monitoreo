#!/bin/bash

set -e

DIR=$(dirname $0)
TEMPLATES=$($DIR/read-templates-configs.sh)

if [[ -z $MONITOREO_ROOT ]]; then
    echo 'Undefined "MONITOREO_ROOT"' >&2
    exit 1
fi

if [[ -z $TERRAFORM_OUTPUT ]]; then
    echo 'Undefined "TERRAFORM_OUTPUT"' >&2
    exit 1
fi

OPS_BUCKET_URL=$(
    echo $TERRAFORM_OUTPUT | jq -r .dataflow.value.GCP_DATAFLOW_BUCKET_OPS_URL
)
REGISTRY_HOST=$(
    echo $TERRAFORM_OUTPUT | jq -r .dataflow.value.GCP_DATAFLOW_TEMPLATES_REGISTRY_HOST
)
REGISTRY_URL=$(
    echo $TERRAFORM_OUTPUT | jq -r .dataflow.value.GCP_DATAFLOW_TEMPLATES_REGISTRY_URL
)
TEMPLATES_BUCKET_URL=$(
    echo $TERRAFORM_OUTPUT | jq -r .dataflow.value.GCP_DATAFLOW_TEMPLATES_BUCKET_URL
)

if [[ -z $BUILDER ]]; then
    echo 'Undefined "BUILDER"' >&2
    exit 1
elif [[ $BUILDER = "local" ]]; then
    echo "Configuring access from local to Docker Artifact Registry repository..."
    gcloud auth configure-docker $REGISTRY_HOST
elif [[ $BUILDER = "cloudbuild" ]]; then
    gcloud config set builds/use_kaniko True
else
    echo "Unknown builder: \"$BUILDER\"" >&2
    exit 1
fi


echo "Building Cloud Dataflow Templates..."
for template in $(echo $TEMPLATES | jq -c .[]); do
    BUILD_LOCATION=$(echo $template | jq -r .build_location)
    BUILD_SETUP_SCRIPT=$(echo $template | jq -r '.build_setup_script // ""')
    DOCKERFILE=$(echo $template | jq -r .dockerfile)
    TEMPLATE_NAME=$(echo $template | jq -r .name)
    TEMPLATE_PY_MAIN_FILE=$(echo $template | jq -r .main_py_file)
    TEMPLATE_JSON_METADATA_FILE=$(echo $template | jq -r .metadata_json_file)
    VERSION=$(date +%F_%H-%M-%S)

    TEMPLATE_IMAGE=${REGISTRY_URL}/${TEMPLATE_NAME}
    TEMPLATE_IMAGE_REF="$TEMPLATE_IMAGE:${VERSION}"
    TEMPLATE_PATH="$TEMPLATES_BUCKET_URL/${TEMPLATE_NAME}.${VERSION}.json"

    echo $TEMPLATE_IMAGE_REF
    echo $TEMPLATE_PATH

    if [[ $BUILD_SETUP_SCRIPT ]]; then
        chmod +x $BUILD_LOCATION/$BUILD_SETUP_SCRIPT
        $BUILD_LOCATION/$BUILD_SETUP_SCRIPT
    fi

    if [[ $BUILDER = "local" ]]; then
        docker build \
            -f $BUILD_LOCATION/$DOCKERFILE \
            -t $TEMPLATE_IMAGE_REF \
            --build-arg TEMPLATE_PY_MAIN_FILE=$TEMPLATE_PY_MAIN_FILE \
            $BUILD_LOCATION
        docker push $TEMPLATE_IMAGE_REF
    elif [[ $BUILDER = "cloudbuild" ]]; then
        # TODO is it possible to use Cloud Build with a custom named Dockerfile file without using cloudbuild.yaml?
        # gcloud builds submit $BUILD_LOCATION \
        #     -f $BUILD_LOCATION/$DOCKERFILE \ ???
        #     --tag $TEMPLATE_IMAGE_REF \
        #     --build-arg TEMPLATE_PY_MAIN_FILE=$TEMPLATE_PY_MAIN_FILE
        CLOUDBUILD_FILE=$(echo $template | jq -r .cloudbuild_file)
        CLOUDBUILD_TIMEOUT=$(echo $template | jq -r '.cloudbuild_timeout // "\"\""')
        
        # gcloud builds submit $BUILD_LOCATION \
        #     --config $BUILD_LOCATION/$CLOUDBUILD_FILE \
        #     --timeout $CLOUDBUILD_TIMEOUT \
        #     --substitutions _OPS_BUCKET_URL=$OPS_BUCKET_URL,_TEMPLATE_IMAGE=$TEMPLATE_IMAGE,_TEMPLATE_PY_MAIN_FILE=$TEMPLATE_PY_MAIN_FILE,_TEMPLATE_VERSION=$VERSION
    else
        echo "Unknown builder: \"$BUILDER\"" >&2
        exit 1
    fi

    gcloud dataflow flex-template build $TEMPLATE_PATH \
        --image $TEMPLATE_IMAGE_REF \
        --sdk-language PYTHON \
        --metadata-file $BUILD_LOCATION/$TEMPLATE_JSON_METADATA_FILE

    # -c to output single shell line per template
    TEMPLATES=$(echo $TEMPLATES | jq -c "
        map(select(.name == \"$TEMPLATE_NAME\") += {
            \"container_spec_gcs_path\": \"$TEMPLATE_PATH\",
            \"version\": \"$VERSION\"
        })
    ")
done

echo "$TEMPLATES" > $DIR/templates.last.json

$MONITOREO_ROOT/infrastructure/databases/insert-dataflow-templates.sh "$TEMPLATES"
