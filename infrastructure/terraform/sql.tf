resource "google_sql_database_instance" "db_instance" {
  name                = "analytics-db-instance"
  database_version    = "POSTGRES_12"
  deletion_protection = true
  region              = var.REGION

  depends_on = [google_service_networking_connection.private_vpc_connection]

  settings {
    tier = "db-f1-micro"

    ip_configuration {
      # private_network = "projects/${var.PROJECT_ID}/global/networks/default"
      private_network = data.google_compute_network.default.id
    }
  }
}

resource "google_sql_database" "database" {
  name     = "analytics"
  instance = google_sql_database_instance.db_instance.name
}

resource "random_password" "database_password" {
  length  = 32
  special = false
}

resource "google_sql_user" "compute" {
  name     = "compute"
  instance = google_sql_database_instance.db_instance.name
  password = random_password.database_password.result
}

resource "google_project_iam_binding" "cloudsql_client" {
  depends_on = [google_project_service.compute]

  members = [local.compute_sa_member]
  project = data.google_project.project.project_id
  role    = "roles/cloudsql.client"
}

# output "database_self_link" {
#   value = google_sql_database_instance.db_instance.self_link
# }
# output "database_private_ip_address" {
#   value = google_sql_database_instance.db_instance.private_ip_address
# }

output "databases_instances" {
  sensitive = true
  value = {
    "${google_sql_database_instance.db_instance.name}" = {
      connection_name = "${google_sql_database_instance.db_instance.connection_name}"
      database        = "${google_sql_database.database.name}"
      password        = "${google_sql_user.compute.password}"
      user            = "${google_sql_user.compute.name}"
    }
  }
}
