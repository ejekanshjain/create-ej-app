terraform {
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "7.8.0"
    }
  }

  backend "gcs" {
    bucket = "project-id-tf-state"
  }
}

provider "google" {
  project = var.project
  region  = var.region
  zone    = var.zone
}
