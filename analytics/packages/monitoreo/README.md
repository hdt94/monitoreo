# `monitoreo` local package

`monitoreo` package defines operators/transformations for Apache Beam Python SDK along with utility functions in following categories:
- Pipeline configuration: [`monitoreo.config`](./monitoreo/config.py)
- I/O: [`monitoreo.io`](./monitoreo/io)
- Processing: [`monitoreo.processing`](./monitoreo/processing)

## Setup

> Note: it's required to install first [`matlab_modal_id` local package](../matlab_modal_id/README.md) for using MATLAB-dependent processing operators/transformations such as `monitoreo.processing.ModalIdFn` or `monitoreo.processing.ProcessResponseFn`.

Install:
```bash
pip install .
```

Install for development:
```bash
pip install -e .
```

## Notes

- `monitoreo.config` adds an `execution_id` to metadata in case of missing.
- Following requirements are explicitly added to solve errors in dependencies resolving:
    ```
    google-api-core[grpc]<2.0.0dev,>=1.22.2
    google-auth<2.0dev,>=1.24.0
    numpy==1.20.3
    pyparsing<3,>=2.4.2
    ```