resource "google_compute_address" "ip" {
  depends_on = [google_project_service.compute]
  name       = "public-vm"
}

resource "google_compute_instance" "vm" {
  machine_type              = "n1-standard-1"
  name                      = "demo-public"
  tags                      = ["allow-http"]
  zone                      = var.ZONE

  allow_stopping_for_update = true
  metadata_startup_script = templatefile("${path.module}/scripts/compute_startup_script.sh", {
    MONITOREO_REPO = var.MONITOREO_REPO
    COMPUTE_SECRET_ID = google_secret_manager_secret.compute_services_settings.id
    COMPUTE_SECRET_VERSION = google_secret_manager_secret_version.compute_services_settings.id
  })

  depends_on = [
    var.MONITOREO_REPO,
    google_secret_manager_secret.compute_services_settings,
    google_secret_manager_secret_version.compute_services_settings
  ]

  boot_disk {
    initialize_params {
      image = "ubuntu-os-cloud/ubuntu-1804-lts"
      #image = "cos-cloud/cos-93-lts"
    }
  }

  network_interface {
    network = "default"

    access_config {
      nat_ip = google_compute_address.ip.address
    }
  }

  service_account {
    email  = "${data.google_project.project.number}-compute@developer.gserviceaccount.com"
    scopes = ["cloud-platform"]
    # scopes = ["cloud-platform", "sqlservice.admin"]
  }
}

resource "google_compute_firewall" "allow_http" {
  depends_on = [google_project_service.compute]

  name          = "allow-http-rule-vm-cos"
  network       = "default"
  source_ranges = ["0.0.0.0/0"]
  target_tags   = ["allow-http"]

  allow {
    ports    = ["80"]
    protocol = "tcp"
  }
}

output "public_ip_address" {
  value = google_compute_address.ip.address
  #   value = google_compute_instance.vm.network_interface.0.network_ip
}
