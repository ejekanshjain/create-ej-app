resource "google_cloud_run_v2_service" "my_app_prod" {
  name     = "my-app-prod"
  location = var.region
  ingress  = "INGRESS_TRAFFIC_INTERNAL_LOAD_BALANCER"

  scaling {
    max_instance_count = 1
  }

  template {
    execution_environment            = "EXECUTION_ENVIRONMENT_GEN2"
    service_account                  = var.compute_service_account
    max_instance_request_concurrency = 80

    vpc_access {
      network_interfaces {
        network    = google_compute_network.vpc_network.name
        subnetwork = google_compute_network.vpc_network.name
      }
      egress = "PRIVATE_RANGES_ONLY"
    }

    containers {
      name  = "my-app-prod-1"
      image = "us-docker.pkg.dev/${var.project}/github/my-app:main"

      ports {
        container_port = 3000
      }

      resources {
        limits = {
          cpu    = "1000m"
          memory = "1Gi"
        }
        cpu_idle          = true
        startup_cpu_boost = true
      }

      env {
        name  = "APP_ENV"
        value = "production"
      }
      env {
        name = "DATABASE_URL"
        value_source {
          secret_key_ref {
            secret  = "PROD_DATABASE_URL"
            version = "latest"
          }
        }
      }

      # Add rest of env variables as needed
    }
  }

  depends_on = [google_sql_database.prod_db]
}

resource "google_cloud_run_service_iam_member" "my_app_prod_unauthenticated" {
  location = google_cloud_run_v2_service.my_app_prod.location
  service  = google_cloud_run_v2_service.my_app_prod.name
  role     = "roles/run.invoker"
  member   = "allUsers"

  depends_on = [google_cloud_run_v2_service.my_app_prod]
}
