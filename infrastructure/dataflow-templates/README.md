# Building Cloud Dataflow Flex Templates

Define environment variables `MONITOREO_ROOT` and `TERRAFORM_OUTPUT` as instructed in [main README.md](/README.md).

Build flex templates with either Cloud Build or local Docker distribution:
```bash
BUILDER=cloudbuild ./build-templates.sh
BUILDER=local ./build-templates.sh
```
> Notes:
> - script creates `templates.last.json` file describing templates.
> - script inserts templates records into analytics database by calling [insert-dataflow-templates.sh](/infrastructure/databases/insert-dataflow-templates.sh); see [corresponding README.md](/infrastructure/databases/README.md).

## Local build requirements

TODO

## `configs.template.json`

File describing configuration of Cloud Dataflow Flex Templates, including location of build directories based on `MONITOREO_ROOT` environment variable.
