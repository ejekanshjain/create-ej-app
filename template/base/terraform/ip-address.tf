resource "google_compute_global_address" "main_lb_ipv4" {
  name         = "main-lb-ipv4"
  ip_version   = "IPV4"
  address_type = "EXTERNAL"
}

resource "google_compute_global_address" "main_lb_ipv6" {
  name         = "main-lb-ipv6"
  ip_version   = "IPV6"
  address_type = "EXTERNAL"
}
