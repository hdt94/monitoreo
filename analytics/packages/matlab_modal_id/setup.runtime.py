import os
import setuptools
import subprocess

from setuptools.command.install import install as _install


MCR = '/usr/local/MATLAB/MATLAB_Runtime'


class install(_install):
    def should_install_matlab_runtime(self):
        # TODO return value based on type of command trigger
        # self.distribution?
        return True

    sub_commands = _install.sub_commands + [('install_matlab_runtime', should_install_matlab_runtime)]


class install_matlab_runtime(setuptools.Command):
    user_options = []

    def initialize_options(self):
        pass

    def finalize_options(self):
        pass

    def get_outputs(self):
        return ["OUTPUT 1?", "OUTPUT 2?"]

    def run(self):
        LD_LIBRARY_PATH = f"{MCR}/v910/runtime/glnxa64:{MCR}/v910/bin/glnxa64:{MCR}/v910/sys/os/glnxa64:{MCR}/v910/extern/bin/glnxa64:{MCR}/v910/sys/opengl/lib/glnxa64"
        location = os.path.dirname(os.path.realpath(__file__))
        RUNTIME_INSTALLATION = f"{location}/runtime_installation.zip"

        if os.path.exists(MCR):
            commands = []
        else:
            commands = [
                ['apt-get', 'update'],
                ['apt-get', '-yq', 'install', 'unzip', 'xorg-dev'],
                ['mkdir', '-p', MCR],
                ['unzip', '-oqq', RUNTIME_INSTALLATION, '-d', MCR],
            ]

        for command_list in commands:
            print(f'command: {command_list}')
            p = subprocess.Popen(
                command_list,
                stdin=subprocess.PIPE,
                stdout=subprocess.PIPE,
                stderr=subprocess.STDOUT)
            stdout_data, _ = p.communicate()
            if p.returncode != 0:
                raise RuntimeError(
                    f'Command {command_list} failed: Exit code: {p.returncode} Command output: "{stdout_data}"')

        # command = f'export LD_LIBRARY_PATH={LD_LIBRARY_PATH}'
        # os.system(command)
        # os.system(f'echo \"{command}\n\" >> ~/.bashrc')


if __name__ == "__main__":
    setuptools.setup(
        name="matlab_modal_id",
        version="20220210",
        platforms=['Linux'],
        data_files=[('', ['installer_input.txt', 'runtime_installation.zip'])],
        packages=['matlab_modal_id'],
        package_data={'matlab_modal_id': ['*.ctf']},
        cmdclass={
            'install': install,
            'install_matlab_runtime': install_matlab_runtime,
        }
    )
