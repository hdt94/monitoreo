terraform {
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "4.2.0"
    }

    google-beta = {
      source  = "hashicorp/google-beta"
      version = "4.2.0"
    }
  }
}

provider "google" {
  project = var.PROJECT_ID
  region  = var.REGION
}

provider "google-beta" {
  project = var.PROJECT_ID
  region  = var.REGION
}

data "google_project" "project" {
  project_id = var.PROJECT_ID
}

resource "google_project_service" "service" {
  for_each = toset([
    "cloudbuild.googleapis.com",
    "sql-component.googleapis.com",
    "sqladmin.googleapis.com",
  ])

  disable_on_destroy = false
  project            = data.google_project.project.project_id
  service            = each.key
}


resource "google_project_service" "artifacts" {
  disable_on_destroy = false
  project            = data.google_project.project.project_id
  service            = "artifactregistry.googleapis.com"
}

resource "google_project_service" "compute" {
  disable_on_destroy = false
  project            = data.google_project.project.project_id
  service            = "compute.googleapis.com"
}

resource "google_project_service" "servicenetworking" {
  disable_on_destroy = false
  project            = data.google_project.project.project_id
  service            = "servicenetworking.googleapis.com"
}

resource "google_project_service" "secretmanager" {
  disable_on_destroy = false
  project            = data.google_project.project.project_id
  service            = "secretmanager.googleapis.com"
}

output "location" {
  value = var.REGION
}

output "project_id" {
  value = var.PROJECT_ID
}
