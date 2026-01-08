resource "google_compute_target_https_proxy" "main_lb_target_proxy" {
  name            = "main-lb-target-proxy"
  url_map         = google_compute_url_map.main_lb.id
  certificate_map = "//certificatemanager.googleapis.com/projects/${var.project}/locations/global/certificateMaps/${google_certificate_manager_certificate_map.default.name}"

  depends_on = [google_compute_url_map.main_lb]
}

resource "google_compute_target_http_proxy" "main_lb_http_redirect_proxy" {
  name    = "main-lb-http-redirect-proxy"
  url_map = google_compute_url_map.main_lb_http_redirect.id

  depends_on = [google_compute_url_map.main_lb_http_redirect]
}
