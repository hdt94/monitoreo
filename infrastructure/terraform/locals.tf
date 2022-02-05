locals {
    compute_sa_member = "serviceAccount:${data.google_project.project.number}-compute@developer.gserviceaccount.com"
}
