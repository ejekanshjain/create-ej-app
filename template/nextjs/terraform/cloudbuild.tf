resource "google_cloudbuild_trigger" "my_app_main_build_trigger" {
  name               = "my-app-main-build-trigger"
  description        = "Build trigger for My App"
  location           = "global"
  include_build_logs = "INCLUDE_BUILD_LOGS_WITH_STATUS"
  disabled           = false

  github {
    owner = "github-username"
    name  = "my-app"
    push {
      branch       = "^main$"
      invert_regex = false
    }
  }

  substitutions = {
    _IMAGE_REGION = "us-docker.pkg.dev"
  }

  service_account = "projects/${var.project}/serviceAccounts/${var.compute_service_account}"

  build {
    timeout = "600s"
    step {
      name = "gcr.io/cloud-builders/docker"
      args = [
        "build",
        "-t",
        "$${_IMAGE_REGION}/$${PROJECT_ID}/github/my-app:$${COMMIT_SHA}",
        "-t",
        "$${_IMAGE_REGION}/$${PROJECT_ID}/github/my-app:main",
        "."
      ]
    }

    step {
      name = "gcr.io/cloud-builders/docker"
      args = [
        "push",
        "$${_IMAGE_REGION}/$${PROJECT_ID}/github/my-app:$${COMMIT_SHA}"
      ]
    }

    step {
      name = "gcr.io/cloud-builders/docker"
      args = [
        "push",
        "$${_IMAGE_REGION}/$${PROJECT_ID}/github/my-app:main"
      ]
    }

    step {
      name = "gcr.io/cloud-builders/gcloud"
      args = [
        "run",
        "deploy",
        "my-app-prod",
        "--image",
        "$${_IMAGE_REGION}/$${PROJECT_ID}/github/my-app:$${COMMIT_SHA}",
        "--region",
        var.region
      ]
    }

    options {
      logging = "CLOUD_LOGGING_ONLY"
    }
  }
}
