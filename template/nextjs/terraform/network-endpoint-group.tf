resource "google_compute_region_network_endpoint_group" "my_app_prod_neg" {
  name                  = "my-app-prod-neg"
  network_endpoint_type = "SERVERLESS"
  region                = var.region

  cloud_run {
    service = google_cloud_run_v2_service.my_app_prod.name
  }

  depends_on = [google_cloud_run_v2_service.my_app_prod]
}
