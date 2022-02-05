# Pipelines for modal identification analytics

This document is written as a step-by-step guide for using external dependencies with Apache Beam Custom Containers and Cloud Dataflow Flex Templates, in this case, MATLAB Runtime.

The pipelines support both batch and stream configuration of input data files. However, I process every file individually, so there's no configuration regarding windowing nor watermarks.

> Notes
> - All instructions in this document has been correctly run in Bash. They should be also compatible with Git-Bash for Windows.
> - In stream pipelines, configuration options of analysis and metadata are overriden by definitions in message; so, those configurations can be ommited in pipeline definition as far as they are defined in message.

## Pre-requisites

- Python 3.7 or 3.8.
- MATLAB compiler supporting Python version.
- If using DataflowRunner or streaming configuration with Cloud Pub/Sub:
    - Project in Google Cloud Platform with billing enabled.
    - `gcloud` from local.

> Notes: 
> - Pipelines have been correctly executed with:
>   - Python 3.7.10 and pip 20.1.1.
>   - Python 3.8.9 and pip 20.2.3.
>   - MATLAB Runtime R2021a.
> - Don't use Cloud Shell for building images locally as it has no disk space enough.

## Setup

### Setup local environment

> Notes:
- setting up local environment is only required if using DirectRunner, PortableRunner, or DataflowRunner with staging from local.
- copy packages source code for building container images as Apache Beam Custom Containers or Cloud Dataflow Flex Templates.

1. Create Python environment
2. Download and install MATLAB Runtime.
3. Install local packages.

#### Python environment
```bash
python3.8 -m venv venv
source ./venv/bin/activate
pip install --upgrade pip setuptools
```
> Note: Python 3.7 can also be used. In such case, modify corresponding version of base images in [Dockerfile.custom-container](Dockerfile.custom-container) and [Dockerfile.dataflow-template](./Dockerfile.dataflow-template)

For development:
```bash
pip install -r requirements.dev.txt
```

#### MATLAB Runtime

MATLAB Runtime is required for local development and execution. See installation instructions in [matlab_modal_id/README.md](../../packages/matlab_modal_id/README.md)

#### Local packages

Define root directories:
```bash
REPO_ROOT=
PACKAGES_ROOT=${REPO_ROOT}/analytics/packages
```

Install packages for development:
```bash
pip install -e $PACKAGES_ROOT/monitoreo
pip install -e $PACKAGES_ROOT/matlab_modal_id
pip install -e $PACKAGES_ROOT/matlab_modal_id $PACKAGES_ROOT/monitoreo
```
> Note: `monitoreo` package is dependent on installation of `matlab_modal_id` package.

Test installation:
```bash
python -c "
import matlab_modal_id
modal_id = matlab_modal_id.runtime.initialize()
output_tuple = modal_id.test_working('test message', nargout=2)
print(output_tuple)
modal_id.terminate()
"
```
It should print: `(0, 'You message is "test message"')`

##### Copy source code

As no publishing nor distribution of these packages is made, building container images as Apache Beam Custom Containers or Cloud Dataflow Flex Templates requires to copy packages source code to local context to comply Dockerfile requirements.
```bash
chmod +x setup-build.sh
./setup-build.sh
```

### Setup cloud environment

Define GCP general variables:
```bash
export GCP_PROJECT_ID=
export GCP_REGION=
```

Login:
```bash
gcloud auth login
gcloud auth application-default login
gcloud config set project $GCP_PROJECT_ID
```

> Notes: as a reference in case of looking for automation, all of following setup steps are automated with Terraform in [infrastructure/terraform/](/infrastructure/terraform/) through [init-cloud-env.sh](/init-cloud-env.sh) for monitoreo prototype.

#### Cloud Storage

Upload data files to Cloud Storage:
> Note: this is optional if using DirectRunner, recommended if using PortableRunner, and required if using DataflowRunner.
```bash
DATA_BUCKET_URL=gs://data-files-${GCP_PROJECT_ID}
gsutil mb -l $GCP_REGION $DATA_BUCKET_URL
gsutil cp -r ./data $DATA_BUCKET_URL
```

Create a bucket for operations if using DataflowRunner:
```bash
OPS_BUCKET_URL=gs://dataflow-ops-${GCP_PROJECT_ID}
gsutil mb -l $GCP_REGION $OPS_BUCKET_URL
```

Create a bucket for specifications of Cloud Dataflow Flex Templates if using them:
```bash
TEMPLATES_BUCKET_URL=gs://dataflow-templates-${GCP_PROJECT_ID}
gsutil mb -l $GCP_REGION $TEMPLATES_BUCKET_URL
```

#### Cloud Pub/Sub
> Note: this is only required if using stream configuration with Cloud Pub/Sub.

Create topic in Cloud Pub/Sub:
```
PUBSUB_TOPIC_NAME=stream-messages
PUBSUB_TOPIC_ID=projects/$GCP_PROJECT_ID/topics/$PUBSUB_TOPIC_NAME
gcloud pubsub topics create $PUBSUB_TOPIC_NAME
```

#### Container images repository

TODO explain repository setup with `gcloud`

Configure Docker registry:
```bash
CONTAINER_REPO_NAME=dataflow-templates
CONTAINER_REPO_URL=$GCP_REGION-docker.pkg.dev/$GCP_PROJECT_ID/$CONTAINER_REPO_NAME
gcloud artifacts repositories create $CONTAINER_REPO_NAME \
    --description="Docker repository" \
    --location=$GCP_REGION \
    --repository-format=docker
```

Setup local Docker distribution if building images locally:
```bash
gcloud auth configure-docker ${GCP_REGION}-docker.pkg.dev
```

#### Cloud Build

Enable Cloud Build if building images with it.

```bash
gcloud services enable cloudbuild.googleapis.com
```

#### Cloud Secrets

> Notes:
> - Using Cloud Secrets for environment configuration is optional. This feature facilitates configuring Dataflow pipelines in the [monitoreo prototype](/README.md) with Terraform provisioning along with [analytics service](/services/analytics/README.md).
> - Consider [further indications](#environment) regarding environment configuration for pipelines in DataflowRunner.

Use the Cloud Secret provided by Terraform in [initialization of monitoreo prototype](/README.md).
```bash
GCP_DATAFLOW_ENV_SECRET=
```

Alternatively, you can create a Cloud Secret with custom environment configuration:
```bash
SECRET_NAME=
gcloud secrets create $SECRET_NAME
gcloud secrets versions add $SECRET_NAME --data-file=$ENV_FILE

# Manual verification
gcloud secrets versions access latest --secret=$SECRET_NAME

GCP_DATAFLOW_ENV_SECRET=projects/${GCP_PROJECT_ID}/secrets/${SECRET_NAME}/versions/latest
GCP_PROJECT_NUMBER=
GCP_DATAFLOW_ENV_SECRET=projects/${GCP_PROJECT_NUMBER}/secrets/${SECRET_NAME}/versions/latest
gcloud secrets versions access latest --secret=$GCP_DATAFLOW_ENV_SECRET
```

## Up and running

1. Define pipeline configuration.
2. Run pipeline in runner of preference.

See [full examples](#full-examples).

### Pipeline configuration

#### Source

TODO create echo pipeline

Define `SOURCE_FILE` with any of the files within [`src/`](./src/) directory:
- [`src/echo.py`](./src/echo.py): batch or stream pipeline to echo input and analysis parameters into database for testing correct workings, specifically, correct configuration and execution of MATLAB Runtime.
- [`src/modal.py`](./src/modal.py): batch or stream pipeline to identify modal properties from vibration responses as REF TEK files using MATLAB Runtime.

Example:
```bash
SOURCE_FILE=src/modal.py
```

#### Input

Define input files as one of the following:
- Double-colon-separated list of files or patterns with `--input-files`:

    Examples:
    > Note: don't miss double quotes if using asterisk to avoid expansion from shell
    - `--input-files ${PWD}/data/221800000_0002BF20`
    - `--input-files "${PWD}/data/*"`
    - `--input-files "gs://project_id/data/*"`
    - `--input-files "gs://project_id/data/*::gs://project_id_2/data/222400000_0002BF20"`

- Cloud Pub/Sub topic publishing messages listing files or patterns with `--input-topic`:

    Examples:
    - `--input-topic $PUBSUB_TOPIC_ID`
    - `--input-topic projects/project_id/topics/topic_name`
    - `--input-topic projects/$GCP_PROJECT_ID/topics/$TOPIC_NAME`
    - `--input-topic projects/natural-stacker-335613/topics/execution-stream`
    > Note: see [configuration of messages](#cloud-pubsub-messages)

#### Analysis

Define analysis parameters as JSON through one of the following:
- JSON file with `--analysis-file "$ANALYSIS_FILE"`:
    ```bash
    python $SOURCE \
        --analysis-file "$ANALYSIS_FILE" \
        --env-literal "$ENV_LITERAL" \
        --input-files ./data/221800000_0002BF20 \
        --runner DirectRunner
    ```
- JSON literal with `--analysis-literal "$ANALYSIS_LITERAL"`:
    ```bash
    python $SOURCE \
        --analysis-literal "$ANALYSIS_LITERAL" \
        --env-literal "$ENV_LITERAL" \
        --input-files /data/221800000_0002BF20 \
        --runner PortableRunner
    ```
    > Note: `--analysis-literal` value must be defined within double quotes to escape quotes from JSON fields and string values.

Example of expected analysis configuration for [`src/modal.py`](src/modal.py):
```json
{
    "response": {
        "use_matlab": true,
        "detrend": true,
        "resampling_rate": 100
    },
    "modal": {
        "technique": "ssi",
        "technique_params": {
            "freqtol": 0.05,
            "mactol": 0.95,
            "minfound": 5,
            "npoints": 1800,
            "order": 16
        }
    }
}
```

See [full examples](#full-examples).

#### Environment

Define environment config for runners through one of the following:
- Environment variables with `--env`.
    ```bash
    python src/modal.py \
        --env \
        --analysis-file "$ANALYSIS_FILE" \
        --input-files "${PWD}/data/221800000_0002BF20" \
        --runner DirectRunner
    ```
- Environment file with `--env-file "$ENV_FILE"`.
    ```bash
    python src/modal.py \
        --env-file .env \
        --analysis-file "$ANALYSIS_FILE" \
        --input-files "${PWD}/data/221800000_0002BF20" \
        --runner DirectRunner
    ```
- Environment literal with `--env-literal "$ENV_LITERAL"`.
    ```bash
    python src/modal-batch.py \
        --env-literal "$ENV_LITERAL" \
        --analysis-literal "$ANALYSIS_LITERAL" \
        --input-files /data/221800000_0002BF20 \
        --runner PortableRunner
    ```
    > Note: `--env-literal` value must be defined within double quotes to preserve any new line character which is used as separator character in parsing.

- Cloud Secret with `--env-cloud-secret "$SECRET"`.
    ```bash
    python src/modal-batch.py \
        --env-cloud-secret projects/my_project/secrets/my_secret/versions/1 \
        --input ${PWD}/data/221800000_0002BF20 \
        --runner DataflowRunner
    ```

Example of expected environment configuration to connect to a PostgreSQL-like sink in local:
```
PGDATABASE=analytics
PGHOST=127.0.0.1
PGPASSWORD=postgres
PGPORT=5432
PGUSER=postgres
```
> Notes:
> - This example configuration corresponds to a local PostgreSQL-like instance described in [analytics service](/services/analytics/README.md) from broader monitoreo prototype.
> - Using DataflowRunner requires a PostgreSQL-like instance accesible from Cloud Dataflow workers. Provisioning and configuration of such instance is made through Terraform in broader monitoreo prototype. See [main README.md](/README.md)

#### Metadata

> Notes:
> - pipeline metadata is optional but useful for querying database.
> - `monitoreo.config` adds an `execution_id` to metadata in case of missing.

Define metadata as JSON through one of the following:
- JSON file with `--metadata-file $METADATA_FILE`:
    ```bash
    python $SOURCE \
        --analysis-file $ANALYSIS_FILE \
        --env-file .env \
        --input-files "${PWD}/data/221800000_0002BF20" \
        --metadata-file $METADATA_FILE \
        --runner DirectRunner
    ```
- JSON literal with `--metadata-literal "$METADATA_LITERAL"`:
    ```bash
    python $SOURCE \
        --analysis-literal "$ANALYSIS_LITERAL" \
        --env-literal "$ENV_LITERAL" \
        --metadata-literal "$METADATA_LITERAL" \
        --input-files /data/221800000_0002BF20 \
        --runner PortableRunner
    ```
    > Note: `--metadata-literal` value must be defined within double quotes to escape quotes from JSON fields and string values.

Example of metadata configuration:
```json
{
    "description": "Measures from lab-20210901",
    "user_id": "john_doe"
}
```

> Note: use `user_id` if database is accessed by other people; it can be anything of a string or number, as far as it's unique between users.


#### Cloud PubSub messages

Cloud Pub/Sub messages for streaming configuration of processing engines list files or patterns as pipeline input. Messages may also include configuration of analysis and/or metadata.

Every message must include `eventType:submission` int its attributes.

Examples of message publication:

```bash
gcloud pubsub topics publish $PUBSUB_TOPIC_ID --attribute=eventType=submission --message "$MESSAGE_DATA_LITERAL"

#  Or
gcloud pubsub topics publish $PUBSUB_TOPIC_ID --attribute=eventType=submission --message "$(cat pipeline.message.json)"
```

Example of message data:
```json
{
    "files": [
        "gs://bucket/data/221800000_0002BF20",
        "gs://bucket/data/*"
    ],
    "metadata": {
        "user_id": 345345
    },
    "analysis": {
        "response": {
            "use_matlab": true,
            "detrend": true,
            "resampling_rate": 100
        },
        "modal": {
            "technique": "ssi",
            "technique_params": {
                "freqtol": 0.05,
                "mactol": 0.95,
                "minfound": 5,
                "npoints": 1800,
                "order": 16
            }
        }
    }
}
```

> Note: "files" field can be defined as a list of files or patterns. Another examples are:

```json
"files": [
    "/local/data/222400000_0002BF20",
    "/local/data/*",
    ],`
```

### DirectRunner

Batch examples:
```bash
python $SOURCE_FILE \
    --analysis-file pipeline.analysis.json \
    --env-file .env \
    --input-files "${PWD}/data/*" \
    --metadata-file pipeline.metadata.json \
    --runner DirectRunner

python $SOURCE_FILE \
    --analysis-file pipeline.analysis.json \
    --env-file .env \
    --input-files "${PWD}/data/221800000_0002BF20::${PWD}/data/222400000_0002BF20" \
    --runner DirectRunner
```

Stream examples:
> Note: configuration options of analysis and metadata are overriden by definitions in message; so, those configurations can be ommited as far as they are defined in message.
``` 
python $SOURCE_FILE \
    --analysis-file pipeline.analysis.json \
    --env-file .env \
    --input-topic $PUBSUB_TOPIC_ID \
    --metadata-file pipeline.metadata.json \
    --runner DirectRunner \
    --streaming

python $SOURCE_FILE \
    --env-file .env \
    --input-topic $PUBSUB_TOPIC_ID \
    --runner DirectRunner \
    --streaming
```

> Note: you can process local files with DirectRunner in streaming configuration by defining their corresponding paths or patterns in Cloud Pub/Sub message: `"files": ["file_path_1", "file_path_2", "pattern_1"]`

### Custom container

#### Build

TODO update Dockerfile.custom-container to latest options related to MATLAB Runtime as defined in Dockerfile.dataflow-template

Build custom container image:
```bash
CUSTOM_IMAGE=custom_container
docker build \
    -t $CUSTOM_IMAGE \
    -f Dockerfile.custom-container \
    .
```
> Notes:
> - Use files in Cloud Storage or any other source file system for pipelines in production with Custom Containers.
> - Copying of [local data directory](data/) in [Dockerfile.custom-container](Dockerfile.custom-container) is for testing purposes considering the lack of volume mapping to PortableRunner. Be sure to have small-size files in this local directory for testing and remove any file for production.


#### PortableRunner

Run pipeline:
```bash
python src/modal.py \
    --analysis-literal "$ANALYSIS_LITERAL" \
    --env-literal "$ENV_LITERAL" \
    --input-files /data/221800000_0002BF20 \
    --job_endpoint=embed \
    --environment_type=DOCKER \
    --environment_config=$CUSTOM_IMAGE \
    --runner PortableRunner
```
> Notes:
> - this setup only support literals for configurations of analysis and environment considering the lack of volume mapping to PortableRunner.
> - don't use literals on production for sensible data such as database credentials. Use instead a service for secret configuration. See example for DataflowRunner with Cloud Secrets.

#### DataflowRunner

TODO example running Custom Container in DataflowRunner


### Flex Template

Building a Cloud Dataflow Flex Template consists of building a container image and a specification.

> Notes:
> - building the container image of a Cloud Dataflow Flex Template requires copying source code of local packages. I've defined a manifest [cloudbuild.dataflow-template.yaml](cloudbuild.dataflow-template.yaml) for using Cloud Build, so local building is optional.
> - initialization of cloud environment through [init-cloud-env.sh](/init-cloud-env.sh) automates following steps regarding provisioning with Terraform for Cloud SQL and Cloud Dataflow; building, publishing, and integrating Flex Template with analytics database. See [main README.md](/README.md) for a general description of the prototype.

#### Container image

> Notes:
> - the configurations used here are demanding regarding disk space but this way those are kept simple.
> - be sure to copy latest files of local packages to [extra_packages/](extra_packages/) directory before running the following.

Define environment variables `MONITOREO_ROOT` as instructed in [main README.md](/README.md).
```bash
export MONITOREO_ROOT=
```

Setup build to copy local packages:
```bash
chmod +x setup-build.sh
./setup-build.sh
```

Build the image using Cloud Build:
```bash
TEMPLATE_NAME=modal
TEMPLATE_PY_MAIN_FILE=src/modal.py
TEMPLATE_VERSION="$(date +%F_%H-%M-%S)"

TEMPLATE_IMAGE=$CONTAINER_REPO_URL/$TEMPLATE_NAME

gcloud config set builds/use_kaniko True
gcloud builds submit . \
    --config cloudbuild.dataflow-template.yaml \
    --timeout 1h \
    --substitutions _OPS_BUCKET_URL=$OPS_BUCKET_URL,_TEMPLATE_IMAGE=$TEMPLATE_IMAGE,_TEMPLATE_PY_MAIN_FILE=$TEMPLATE_PY_MAIN_FILE,_TEMPLATE_VERSION=$TEMPLATE_VERSION
```

Alternatively, you can locally build and push the image:
```bash
TEMPLATE_IMAGE_REF=$TEMPLATE_IMAGE:$TEMPLATE_VERSION
./extra_packages/matlab_modal_id/runtime.download.sh \
          extra_packages/matlab_modal_id/ \
          ${OPS_BUCKET_URL}
docker build \
    -t $TEMPLATE_IMAGE_REF \
    -f Dockerfile.dataflow-template \
    --build-arg TEMPLATE_PY_MAIN_FILE=$TEMPLATE_PY_MAIN_FILE \
    .
docker push $TEMPLATE_IMAGE
```

#### Specification

Build Flex Template specification:
```bash
TEMPLATE_PATH="$TEMPLATES_BUCKET_URL/${TEMPLATE_NAME}.${TEMPLATE_VERSION}.json"
gcloud dataflow flex-template build $TEMPLATE_PATH \
    --image "$TEMPLATE_IMAGE" \
    --sdk-language "PYTHON" \
    --metadata-file "metadata.dataflow-template.json"
```

#### DataflowRunner

Run batch job:
```bash
JOB_NAME="${TEMPLATE_NAME}-$(date +%Y%m%d-%H%M%S)"
gcloud dataflow flex-template run $JOB_NAME \
    --num-workers 1 \
    --region "$GCP_REGION" \
    --template-file-gcs-location $TEMPLATE_PATH \
    --worker-machine-type "e2-highmem-2" \
    --parameters input-files="$DATA_BUCKET_URL/data/221800000_0002BF20" \
    --parameters env-cloud-secret="$GCP_DATAFLOW_ENV_SECRET" \
    --parameters ^@^analysis-literal="$ANALYSIS_LITERAL" \
    --parameters ^@^metadata-literal="$METADATA_LITERAL"
```

Run stream job:
```
JOB_NAME="${TEMPLATE_NAME}-$(date +%Y%m%d-%H%M%S)"
gcloud dataflow flex-template run $JOB_NAME \
    --num-workers 1 \
    --region "$GCP_REGION" \
    --template-file-gcs-location $TEMPLATE_PATH \
    --worker-machine-type "n1-standard-2" \
    --parameters ^@^analysis-literal="$ANALYSIS_LITERAL" \
    --parameters input-topic=$PUBSUB_TOPIC_ID \
    --parameters env-cloud-secret="$GCP_DATAFLOW_ENV_SECRET" \
    --parameters ^@^metadata-literal="$METADATA_LITERAL"
```
> Note: `--streaming` is added by `src/modal.py` when using `input-topic`.

Publish message:
```bash
gcloud pubsub topics publish $PUBSUB_TOPIC_ID --attribute=eventType=submission --message "$MESSAGE_DATA_LITERAL"
```
> Note: see [configuration of messages](#cloud-pubsub-messages)


#### DirectRunner (testing)

You can run your template image for testing and debugging execution out of Cloud Dataflow service by running a local container with either local or cloud resources of data file input and database service:

> Note: this is meant for locally testing the execution of extra packages along with its dependencies in Flex Template. This is not a recommended method for exeuting pipelines in development nor production.

- Run container with local resources:
    ```bash
    docker run -it \
        --name template \
        --entrypoint bash \
        --network host \
        -v $PWD/data:/data \
        $TEMPLATE_IMAGE
    ```

    Within container:
    ```bash
    python main.py \
        --input-files /data/221800000_0002BF20 \
        --analysis-literal "$ANALYSIS_LITERAL" \
        --env-literal "$ENV_LITERAL" \
        --runner DirectRunner
    ```
- Run container with cloud resources:
    ```bash
    docker run -it \
        --name template \
        --entrypoint bash \
        $TEMPLATE_IMAGE
    ```

    Within container:
    ```bash
    python main.py \
        --input "$DATA_BUCKET_URL/data/221800000_0002BF20" \
        --analysis-literal "$ANALYSIS_LITERAL" \
        --env-cloud-secret $GCP_DATAFLOW_ENV_SECRET \
        --runner DirectRunner
    ```

## Examples of analysis config

### Response processing

Downsampling with Obspy (no filter is applied):
```
{
    "response": {
        "use_obspy": true,
        "decimate_ratio": 10
    }
}
```

Detrending and downsampling with Obspy (no filter is applied):
```
{
    "response": {
        "use_obspy": true,
        "detrend": true,
        "decimate_ratio": 10
    }
}
```

Resampling with MATLAB:
> Notes:
> - Default filters are applied.
> - `resampling_rate` is frequency of resulting response; the `q` parameter at MATLAB docs for `resample` function.
> - See following for more details: [https://www.mathworks.com/help/signal/ref/resample.html](https://www.mathworks.com/help/signal/ref/resample.html)
```json
{
    "response": {
        "use_matlab": true,
        "resampling_rate": 20
    }
}
```

## Full examples

### DirectRunner

Example with analysis file, env file, metadata file, and DirectRunner:
```bash
cat << EOF > pipeline.analysis.json
{
    "response": {
        "use_matlab": true,
        "detrend": true,
        "resampling_rate": 100
    },
    "modal": {
        "technique": "ssi",
        "technique_params": {
            "freqtol": 0.05,
            "mactol": 0.95,
            "minfound": 5,
            "npoints": 1800,
            "order": 16
        }
    }
}
EOF

cat << EOF > .env
PGDATABASE=analytics
PGHOST=127.0.0.1
PGPASSWORD=postgres
PGPORT=5432
PGUSER=postgres
EOF

cat << EOF > pipeline.metadata.json
{
    "description": "Measures from lab-20210901",
    "user_id": "john_doe"
}
EOF

python src/modal.py \
    --analysis-file pipeline.analysis.json \
    --env-file .env \
    --input-files "${PWD}/data/221800000_0002BF20" \
    --metadata-file pipeline.metadata.json \
    --runner DirectRunner

# Or
python src/modal.py \
    --analysis-file pipeline.analysis.json \
    --env-file .env \
    --input-files "${PWD}/data/221800000_0002BF20::${PWD}/data/222400000_0002BF20" \
    --metadata-file pipeline.metadata.json \
    --runner DirectRunner

# Or
python src/modal.py \
    --analysis-file pipeline.analysis.json \
    --env-file .env \
    --input-files "${PWD}/data/*" \
    --metadata-file pipeline.metadata.json \
    --runner DirectRunner
```

Example with analysis literal, env file, and DirectRunner:
```bash
ANALYSIS_LITERAL='
{
    "response": {
        "use_matlab": true,
        "detrend": true,
        "resampling_rate": 100
    },
    "modal": {
        "technique": "ssi",
        "technique_params": {
            "freqtol": 0.05,
            "mactol": 0.95,
            "minfound": 5,
            "npoints": 1800,
            "order": 16
        }
    }
}
'

python src/modal.py \
    --analysis-literal "$ANALYSIS_LITERAL" \
    --env-file .env \
    --input-files ${PWD}/data/221800000_0002BF20 \
    --runner DirectRunner
```

### PortableRunner

Example with analysis literal, env literal, custom container and PortableRunner:
```bash
ANALYSIS_LITERAL='
{
    "response": {
        "use_matlab": true,
        "detrend": true,
        "resampling_rate": 100
    },
    "modal": {
        "technique": "ssi",
        "technique_params": {
            "freqtol": 0.05,
            "mactol": 0.95,
            "minfound": 5,
            "npoints": 1800,
            "order": 16
        }
    }
}
'

ENV_LITERAL='
PGDATABASE=analytics
PGHOST=127.0.0.1
PGPASSWORD=postgres
PGPORT=5432
PGUSER=postgres
'

python src/modal.py \
    --analysis-literal "$ANALYSIS_LITERAL" \
    --env-literal "$ENV_LITERAL" \
    --input /data/221800000_0002BF20 \
    --job_endpoint=embed \
    --environment_type=DOCKER \
    --environment_config=$CUSTOM_IMAGE \
    --runner PortableRunner
```
