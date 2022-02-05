resource "google_secret_manager_secret" "dataflow_worker_settings" {
  secret_id = "dataflow_worker_settings"

  replication {
    automatic = true
  }
  depends_on = [google_project_service.secretmanager]
}

resource "google_secret_manager_secret_version" "dataflow_worker_settings" {
  secret      = google_secret_manager_secret.dataflow_worker_settings.id
  secret_data = <<EOF
PGDATABASE=${google_sql_database.database.name}
PGHOST=${google_sql_database_instance.db_instance.private_ip_address}
PGPASSWORD=${google_sql_user.compute.password}
PGPORT=${5432}
PGUSER=${google_sql_user.compute.name}
PUBSUB_TOPIC_STREAM_EXECUTION=${google_pubsub_topic.stream.id}
  EOF
}

resource "google_secret_manager_secret_iam_binding" "dataflow_worker_settings" {
  secret_id = google_secret_manager_secret.dataflow_worker_settings.id
  role      = "roles/secretmanager.secretAccessor"
  members   = [local.compute_sa_member]
}

