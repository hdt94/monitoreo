

resource "google_storage_bucket" "measures_batch" {
  name     = "measures-batch-${var.PROJECT_ID}"
  location = var.REGION
}

resource "google_storage_bucket" "measures_stream" {
  name     = "measures-stream-${var.PROJECT_ID}"
  location = var.REGION
}

output "gs_bucket_measures_batch" {
  value = google_storage_bucket.measures_batch.id
}

output "gs_bucket_measures_stream" {
  value = google_storage_bucket.measures_stream.id
}

