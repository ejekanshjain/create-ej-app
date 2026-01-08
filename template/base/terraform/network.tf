resource "google_compute_network" "vpc_network" {
  name = "terraform-network"
}

resource "google_compute_global_address" "private_ip_range" {
  name          = "private-ip-range"
  prefix_length = 16
  address_type  = "INTERNAL"
  purpose       = "VPC_PEERING"
  network       = google_compute_network.vpc_network.self_link

  depends_on = [google_compute_network.vpc_network]
}

resource "google_service_networking_connection" "private_connection" {
  network                 = google_compute_network.vpc_network.id
  service                 = "servicenetworking.googleapis.com"
  reserved_peering_ranges = [google_compute_global_address.private_ip_range.name]

  depends_on = [google_compute_global_address.private_ip_range]
}
