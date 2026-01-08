resource "google_artifact_registry_repository" "github" {
  repository_id = "github"
  location      = "us"
  format        = "DOCKER"
}
