Vagrant.configure("2") do |config|
    config.vm.box = "ubuntu/focal64"
    config.vm.hostname = File.basename(Dir.getwd)
    config.vm.boot_timeout = 1200

    config.disksize.size = '50GB'
  
    config.vm.network "forwarded_port", guest: 80, host: 8800
    config.vm.network "forwarded_port", guest: 443, host: 4430
    config.vm.network "forwarded_port", guest: 3000, host: 3000
    config.vm.network "forwarded_port", guest: 3030, host: 3030
    config.vm.network "forwarded_port", guest: 5050, host: 5050
    config.vm.network "forwarded_port", guest: 5432, host: 5432
    config.vm.network "forwarded_port", guest: 8080, host: 8080
    config.vm.network "forwarded_port", guest: 8086, host: 8086
    config.vm.network "forwarded_port", guest: 27017, host: 27017
    config.vm.network "forwarded_port", guest: 30000, host: 30000
    config.vm.network "forwarded_port", guest: 32000, host: 32000
  
    config.vm.provision "docker"
    config.vm.provision "shell", path: "init-local-env.sh"
  
    config.vm.provider "virtualbox" do |vb|
      vb.customize [
        "modifyvm", :id,
        "--memory", "2200",
        "--uartmode1", "disconnected"
      ]
    end
  end
  
