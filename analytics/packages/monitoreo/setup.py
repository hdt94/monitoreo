import setuptools


def read_requirements():
    with open('requirements.txt', 'r') as file:
        lines = file.read().split('\n')
        packages = filter(lambda line: len(line) > 0, lines)

    return list(packages)


setuptools.setup(
    name='monitoreo',
    version='202112',
    data_files=[('', ['requirements.txt'])],
    package_dir={'': '.'},
    packages=setuptools.find_packages(where='.'),
    install_requires=read_requirements(),
)
