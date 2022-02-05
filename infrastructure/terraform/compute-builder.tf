resource "google_compute_disk" "builder_disk" {
  name = "storage"
  size = "100"
  type = "pd-standard"
  zone = var.ZONE
}

resource "google_compute_instance" "builder" {
  name                      = "builder"
  machine_type              = "e2-highmem-2"
  zone                      = var.ZONE
  allow_stopping_for_update = true

  attached_disk {
    source = google_compute_disk.builder_disk.name
  }

  boot_disk {
    initialize_params {
      image = "ubuntu-os-cloud/ubuntu-1804-lts"
    }
  }

  network_interface {
    # ssh private usage only
    network = "default"

    access_config {
      # It's required to give access to inbound traffic?
    }
  }

  service_account {
    # it defaults to compute service account
    # email  = "${data.google_project.project.number}-compute@developer.gserviceaccount.com"
    scopes = ["cloud-platform"]
  }
}
