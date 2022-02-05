import setuptools


if __name__ == "__main__":
    setuptools.setup(
        name="matlab_modal_id",
        version="R2021a",
        platforms=['Linux'],
        packages=['matlab_modal_id'],
        package_data={'matlab_modal_id': ['*.ctf']},
    )
