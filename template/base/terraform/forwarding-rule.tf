resource "google_compute_global_forwarding_rule" "main_lb_https_ipv4_frontend" {
  name                  = "main-lb-https-ipv4-frontend"
  ip_protocol           = "TCP"
  ip_address            = google_compute_global_address.main_lb_ipv4.address
  load_balancing_scheme = "EXTERNAL_MANAGED"
  port_range            = "443"
  target                = google_compute_target_https_proxy.main_lb_target_proxy.id

  depends_on = [google_compute_global_address.main_lb_ipv4, google_compute_target_https_proxy.main_lb_target_proxy]
}

resource "google_compute_global_forwarding_rule" "main_lb_https_ipv6_frontend" {
  name                  = "main-lb-https-ipv6-frontend"
  ip_protocol           = "TCP"
  ip_address            = google_compute_global_address.main_lb_ipv6.address
  load_balancing_scheme = "EXTERNAL_MANAGED"
  port_range            = "443"
  target                = google_compute_target_https_proxy.main_lb_target_proxy.id

  depends_on = [google_compute_global_address.main_lb_ipv6, google_compute_target_https_proxy.main_lb_target_proxy]
}

resource "google_compute_global_forwarding_rule" "main_lb_ipv4_http_forwarding_rule" {
  name                  = "main-lb-ipv4-http-forwarding-rule"
  ip_protocol           = "TCP"
  ip_address            = google_compute_global_address.main_lb_ipv4.address
  load_balancing_scheme = "EXTERNAL_MANAGED"
  port_range            = "80"
  target                = google_compute_target_http_proxy.main_lb_http_redirect_proxy.id

  depends_on = [google_compute_global_forwarding_rule.main_lb_https_ipv4_frontend]
}

resource "google_compute_global_forwarding_rule" "main_lb_ipv6_http_forwarding_rule" {
  name                  = "main-lb-ipv6-http-forwarding-rule"
  ip_protocol           = "TCP"
  ip_address            = google_compute_global_address.main_lb_ipv6.address
  load_balancing_scheme = "EXTERNAL_MANAGED"
  port_range            = "80"
  target                = google_compute_target_http_proxy.main_lb_http_redirect_proxy.id

  depends_on = [google_compute_global_forwarding_rule.main_lb_https_ipv6_frontend]
}
