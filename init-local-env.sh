#!/bin/bash

set -e

sudo apt-get -q update
sudo apt-get -q install -y htop

# docker-compose
# https://docs.docker.com/compose/install/
sudo curl -sL "https://github.com/docker/compose/releases/download/1.25.5/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# gcloud
# https://cloud.google.com/sdk/docs/install
sudo apt-get -q install -y apt-transport-https ca-certificates gnupg
echo "deb [signed-by=/usr/share/keyrings/cloud.google.gpg] https://packages.cloud.google.com/apt cloud-sdk main" | sudo tee -a /etc/apt/sources.list.d/google-cloud-sdk.list
curl -s https://packages.cloud.google.com/apt/doc/apt-key.gpg | sudo apt-key --keyring /usr/share/keyrings/cloud.google.gpg add -
sudo apt-get -qq update
sudo apt-get -q install -y google-cloud-sdk

# java
# Required for local development and execution of data pipelines dependent on MATLAB Runtime
echo "Installing java..."
curl -sLO https://download.java.net/openjdk/jdk11/ri/openjdk-11+28_linux-x64_bin.tar.gz
tar -xzf openjdk-11+28_linux-x64_bin.tar.gz
sudo mv jdk-11/ /opt/
sudo bash -c 'cat << EOF > /etc/environment
JAVA_HOME="/opt/jdk-11"
PATH="/opt/jdk-11/bin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin:/snap/bin"
EOF
'

# nodejs (NodeSource)
# Optional for local development out of Docker
# https://github.com/nodesource/distributions#debinstall
curl -fsSL https://deb.nodesource.com/setup_14.x | sudo -E bash -
sudo apt-get -q install -y nodejs

# psql
# Required to debug database
# https://www.postgresql.org/download/linux/debian/
sudo sh -c 'echo "deb http://apt.postgresql.org/pub/repos/apt $(lsb_release -cs)-pgdg main" > /etc/apt/sources.list.d/pgdg.list'
curl --insecure -sO https://www.postgresql.org/media/keys/ACCC4CF8.asc
sudo apt-key add ACCC4CF8.asc
sudo apt-get -qq update
sudo apt-get -q install -y postgresql-client-12

# python
# Required only for local development and execution of data pipelines
# https://launchpad.net/~deadsnakes/+archive/ubuntu/ppa
sudo apt-get -q install -y software-properties-common
sudo add-apt-repository -y ppa:deadsnakes/ppa
sudo apt-get -qq update
sudo apt-get -q install -y python3.7 python3.7-venv python3.7-dev
sudo apt-get -q install -y python3.8 python3.8-venv python3.8-dev

# terraform
# https://www.terraform.io/cli/install/apt
curl -fsSL https://apt.releases.hashicorp.com/gpg | sudo apt-key add -
sudo apt-add-repository "deb [arch=$(dpkg --print-architecture)] https://apt.releases.hashicorp.com $(lsb_release -cs) main"
sudo apt -q install -y terraform
