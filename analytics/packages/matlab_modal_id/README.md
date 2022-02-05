# `matlab_modal_id` local package

`matlab_modal_id` is a Python package that allows processing vibration response data for dynamic characterization from Python based on MATLAB signal processing and `Modal ID`, a MATLAB library for modal identification written by "Grupo de Investigación G7" (Research Group G7).

I coded [MATLAB functions](./matlab_functions/) as interfaces that must be compiled using MATLAB Compiler SDK along with `Modal ID` dependencies.

> Note: `Modal ID` files are not provided in this repository considering private sourcing from research group. So, this guide is meant mainly for members of research group.

## Setup

1. Compile MATLAB algorithms into Python Package.
2. Download and install MATLAB Runtime.
3. Install `matlab_modal_id` package.

### Compile MATLAB algorithms into Python Package

Compile MATLAB packages for Python following [compile_matlab_packages.md][./compile_matlab_packages.md]

Compile [MATLAB functions](./matlab_functions/) through MATLAB command window to generate output files:
```matlab
packageName = 'matlab_modal_id';
appFiles = {'identify.m', 'process_response.m', 'test_working.m'};
outDir = fullfile('matlab_modal_id');
compiler.build.pythonPackage(appFiles, 'PackageName',packageName, 'OutputDir',outDir);
```

> Notes:
> - Add `ModalId` files into MATLAB path before compilation.
> - `identify.m` is a simple wrapper of `nexteraId.m` and `ssiId.m` to facilitate calls from Python with dictionaries using the default `nargout=1`.
> - functions `ssiId.m` and `nexteraId.m` may not be part of `Modal ID` files, be sure to require them to research group.

Copy the output file `matlab_modal_id/for_redistribution_files_only/matlab_modal_id/matlab_modal_id.ctf` to [matlab_modal_id/](./matlab_modal_id/) (child directory of directory containing this document). Ignore the output configuration `matlab_modal_id/for_redistribution_files_only/matlab_modal_id/__init__.py`.

The file in this directory [`installer_input.txt`](./installer_input.txt) contains the instructions for MATLAB Runtime installer, including the codes corresponding to the MATLAB products required by [functions](./matlab_functions/) and `Modal ID` listed on the output file `matlab_modal_id/for_testing/requiredMCRProducts.txt`: 35000, 35010, 35108, 35055.

The content of this latter file is the following:
```
mode silent
agreeToLicense yes
product.MATLAB_Runtime___Core true
product.MATLAB_Runtime___Numerics true
product.MATLAB_Runtime___Python true
product.MATLAB_Runtime___Signal_Processing_Toolbox_Addin true
```

### Download and install MATLAB Runtime

I coded three scripts to facilitate downloading and installing MATLAB Runtime, and packaging of source distribution; preserving correct the configurations in this package such as downloading installer as `runtime_installer.zip` and using `runtime_installation.zip` to include installation into source distribution to optimize building Cloud Dataflow Flex Templates.

General use:
- Download MATLAB Runtime installer:
    ```bash
    # Download to same directory of script
    ./runtime.download.sh

    # Download to custom directory
    ./runtime.download.sh /custom-dir

    # Download to custom directory, copy to bucket on first time, copy from bucket on later times (if found, otherwise, copy to bucket)
    ./runtime.download.sh /custom-dir gs://bucket_id/prefix/
    ```

- Install MATLAB Runtime:
    > Note: currently it's fixed to `/usr/local/MATLAB/MATLAB_Runtime`
    ```bash
    # Install
    INSTALLATION_DIR=/usr/local/MATLAB/MATLAB_Runtime
    ./runtime.install.sh $INSTALLATION_DIR

    # Install and remove installer to optimize disk space in container images
    INSTALLATION_DIR=/usr/local/MATLAB/MATLAB_Runtime
    ./runtime.install.sh $INSTALLATION_DIR --remove-installer
    ```
- Zip current installation of MATLAB Runtime:
    > Note: currently it's fixed to `/usr/local/MATLAB/MATLAB_Runtime`
    ```bash
    # Zip
    INSTALLATION_DIR=/usr/local/MATLAB/MATLAB_Runtime
    ./runtime.zip.sh $INSTALLATION_DIR

    # Zip and remove installation to optimize disk space in container images
    INSTALLATION_DIR=/usr/local/MATLAB/MATLAB_Runtime
    ./runtime.zip.sh $INSTALLATION_DIR --remove-installation
    ```

Notes regarding scripts and MATLAB Runtime:
- All scripts are meant to be run in Debian-based Linux distributions.
- Corresponding MATLAB Runtime version used in scripts is R2021a for Linux.
- Installer is downloaded as `runtime_installer.zip` file.
- Installation is made in hardcoded directory `/usr/local/MATLAB/MATLAB_Runtime`.
- Definition of "LD_LIBRARY_PATH" environment variable is avoid. Instead, it's hardcoded.
- Installation files are zipped as `runtime_installation.zip` to easily distribute `matlab_modal_id` package to optimize building Cloud Dataflow Flex Templates.

### Install `matlab_modal_id` package

Install:
```bash
pip install .
```

Install for development:
```bash
pip install -e .
```

Test working:
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

It's required to initialize runtime before importing `matlab`:
```python
import matlab_modal_id
modal_id = matlab_modal_id.runtime.initialize()

import matlab
print(matlab.double([5]))

modal_id.terminate()
```

## Distribution

Setup MATLAB Runtime:
```bash
chmod +x ./runtime.*.sh
./runtime.download.sh
./runtime.install.sh
./runtime.zip.sh
```

Build source distribution:
```bash
python setup.runtime.py sdist
```

> Note: some optimizations for building source distribution with Docker are exemplified in [modal Dockerfile.dataflow-template](/analytics/pipelines/modal/Dockerfile.dataflow-template)

## TODOs
TODO un-harcode installation directory in module
MCR = '/usr/local/MATLAB/MATLAB_Runtime'

TODO example with any other matlab algorithms to enable externals to check procedure

TODO
Termination of MATLAB Runtime instance within processing Apache Beam operators/transformations lifecyles in `teardown()` method may bring collision errors:
```
RuntimeError: identify() cannot be called after terminate() has been called on the package matlab_modal_id
```
Proposal: ¿single instance per operator?
