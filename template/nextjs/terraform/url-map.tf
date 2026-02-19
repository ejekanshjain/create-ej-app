resource "google_compute_url_map" "main_lb" {
  name            = "main-lb"
  default_service = google_compute_backend_service.my_app_prod_service.id

  host_rule {
    path_matcher = "path-matcher-my-app-prod"
    hosts        = ["myapp.com"]
  }
  path_matcher {
    name            = "path-matcher-my-app-prod"
    default_service = google_compute_backend_service.my_app_prod_service.id
  }
}

resource "google_compute_url_map" "main_lb_http_redirect" {
  name = "main-lb-http-to-https-redirect"

  default_url_redirect {
    https_redirect         = true
    strip_query            = false
    redirect_response_code = "MOVED_PERMANENTLY_DEFAULT"
  }
}
