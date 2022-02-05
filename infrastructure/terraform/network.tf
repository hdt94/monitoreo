# Creating custom VPC
# resource "google_compute_network" "private_network" {
#   name = "vpc-network"
# }

# Using default VPC
data "google_compute_network" "default" {
  name       = "default"
  depends_on = [google_project_service.servicenetworking]
}

resource "google_compute_global_address" "private_ip_address" {
  name          = "private-ip-address"
  purpose       = "VPC_PEERING"
  address_type  = "INTERNAL"
  prefix_length = 16
  #   network       = google_compute_network.private_network.id
  network = data.google_compute_network.default.id
}

resource "google_service_networking_connection" "private_vpc_connection" {
  #   network                 = google_compute_network.private_network.id
  network                 = data.google_compute_network.default.id
  service                 = "servicenetworking.googleapis.com"
  reserved_peering_ranges = [google_compute_global_address.private_ip_address.name]

  # Required?
  depends_on = [google_project_service.servicenetworking]
}

output "default_network_id" {
  # projects/qwiklabs-gcp-04-37b6e15d6165/global/networks/default
  value = data.google_compute_network.default.id
}
