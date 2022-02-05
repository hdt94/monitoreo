resource "random_password" "grafana_admin_password" {
  length  = 32
  special = false
}

resource "google_secret_manager_secret" "compute_services_settings" {
  secret_id = "compute_services_settings"

  replication {
    automatic = true
  }
  depends_on = [google_project_service.secretmanager]
}

resource "google_secret_manager_secret_version" "compute_services_settings" {
  secret      = google_secret_manager_secret.compute_services_settings.id
  secret_data = <<EOF
GCP_ANALYTICS_ENV_CLOUD_SECRET="${google_secret_manager_secret_version.dataflow_worker_settings.id}"
GCP_LOCATION="${var.REGION}"
GCP_PROJECT_ID="${var.PROJECT_ID}"
GCP_PUBSUB_TOPIC_STREAM="${google_pubsub_topic.stream.id}"
GRAFANA_ADMIN_PASSWORD="${random_password.grafana_admin_password.result}"
GS_BUCKET_MEASURES_BATCH="${google_storage_bucket.measures_batch.id}"
HOST_DOMAIN="${google_compute_address.ip.address}"
  EOF
}

resource "google_secret_manager_secret_iam_binding" "compute_services_settings" {
  secret_id = google_secret_manager_secret.compute_services_settings.id
  role      = "roles/secretmanager.secretAccessor"
  members   = [local.compute_sa_member]
}

output compute_services_settings {
  value = {
    secret = google_secret_manager_secret.compute_services_settings.id
    version = google_secret_manager_secret_version.compute_services_settings.id
  }
}