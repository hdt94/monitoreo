resource "google_project_service" "dataflow" {
  disable_on_destroy = false
  project            = data.google_project.project.project_id
  service            = "dataflow.googleapis.com"
}

resource "google_project_iam_binding" "dataflow_admin" {
  depends_on = [google_project_service.compute]

  members = [local.compute_sa_member]
  project = data.google_project.project.project_id
  role    = "roles/dataflow.admin"
}

# https://registry.terraform.io/providers/hashicorp/google/latest/docs/resources/artifact_registry_repository#attributes-reference
resource "google_artifact_registry_repository" "dataflow_templates" {
  depends_on = [google_project_service.artifacts]

  provider = google-beta

  description   = "Docker repository for Dataflow Flex Templates"
  format        = "DOCKER"
  location      = var.REGION
  repository_id = "dataflow-templates"
}

resource "google_artifact_registry_repository_iam_member" "dataflow_reader" {
  provider = google-beta

  location   = google_artifact_registry_repository.dataflow_templates.location
  member     = local.compute_sa_member
  repository = google_artifact_registry_repository.dataflow_templates.name
  role       = "roles/artifactregistry.reader"
}

resource "google_storage_bucket" "analytics_batch_files" {
  force_destroy = true
  location      = var.REGION
  name          = "analytics-batch-files-${var.PROJECT_ID}"
}

resource "google_storage_bucket" "dataflow_ops" {
  force_destroy = true
  location      = var.REGION
  name          = "dataflow-ops-${var.PROJECT_ID}"
}

resource "google_storage_bucket" "dataflow_templates" {
  force_destroy = true
  location      = var.REGION
  name          = "dataflow-templates-${var.PROJECT_ID}"
}


locals {
  GCP_DATAFLOW_TEMPLATES_REGISTRY_HOST = "${var.REGION}-docker.pkg.dev"
}

output "dataflow" {
  value = {
    GCP_DATAFLOW_BUCKET_BATCH_URL     = google_storage_bucket.analytics_batch_files.url
    GCP_DATAFLOW_BUCKET_OPS_URL       = google_storage_bucket.dataflow_ops.url
    GCP_DATAFLOW_ENV_SECRET           = google_secret_manager_secret_version.dataflow_worker_settings.id
    GCP_DATAFLOW_TEMPLATES_BUCKET_URL = google_storage_bucket.dataflow_templates.url
    # GCP_DATAFLOW_TEMPLATES_REGISTRY_HOST = local.GCP_DATAFLOW_TEMPLATES_REGISTRY_HOST
    GCP_DATAFLOW_TEMPLATES_REGISTRY_HOST = "${local.GCP_DATAFLOW_TEMPLATES_REGISTRY_HOST}"
    GCP_DATAFLOW_TEMPLATES_REGISTRY_URL  = "${local.GCP_DATAFLOW_TEMPLATES_REGISTRY_HOST}/${var.PROJECT_ID}/${google_artifact_registry_repository.dataflow_templates.repository_id}"
    # GCP_DATAFLOW_TEMPLATES_REGISTRY_HOST = "${var.REGION}-docker.pkg.dev"
    # GCP_DATAFLOW_TEMPLATES_URL = "${var.REGION}-docker.pkg.dev/${var.PROJECT_ID}/${google_artifact_registry_repository.dataflow_templates.repository_id}"
  }
}

