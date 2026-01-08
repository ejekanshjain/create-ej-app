resource "google_compute_backend_service" "my_app_prod_service" {
  name = "my-app-prod-service"

  backend {
    group = google_compute_region_network_endpoint_group.my_app_prod_neg.id
  }

  protocol              = "HTTPS"
  locality_lb_policy    = "ROUND_ROBIN"
  load_balancing_scheme = "EXTERNAL_MANAGED"

  depends_on = [google_compute_region_network_endpoint_group.my_app_prod_neg]
}
