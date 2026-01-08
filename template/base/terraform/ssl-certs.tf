resource "google_certificate_manager_certificate" "my_app_cert" {
  name = "my-app-cert"

  managed {
    domains = [
      "myapp.com"
    ]
    dns_authorizations = [
      google_certificate_manager_dns_authorization.my_app_prod_auth.id,
    ]
  }

  depends_on = [
    google_certificate_manager_dns_authorization.my_app_prod_auth,
  ]
}

resource "google_certificate_manager_dns_authorization" "my_app_prod_auth" {
  name   = "my-app-prod-auth"
  domain = "myapp.com"
}

resource "google_certificate_manager_certificate_map" "default" {
  name = "default-cert-map"
}

resource "google_certificate_manager_certificate_map_entry" "my_app_prod_entry" {
  name         = "my-app-prod-entry"
  map          = google_certificate_manager_certificate_map.default.name
  hostname     = "myapp.com"
  certificates = [google_certificate_manager_certificate.my_app_cert.id]
}
