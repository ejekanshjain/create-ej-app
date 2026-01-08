resource "google_sql_database_instance" "prod_postgres_instance" {
  name             = "prod-db"
  database_version = "POSTGRES_17"

  settings {
    location_preference {
      zone = var.zone
    }

    edition                     = "ENTERPRISE"
    tier                        = "db-f1-micro"
    deletion_protection_enabled = true

    disk_size                = 10
    disk_autoresize          = true
    retain_backups_on_delete = true

    backup_configuration {
      enabled                        = true
      start_time                     = "00:00"
      point_in_time_recovery_enabled = true
      backup_retention_settings {
        retained_backups = 30
      }
      transaction_log_retention_days = 7
    }

    ip_configuration {
      private_network = google_compute_network.vpc_network.self_link
      ipv4_enabled    = true
      authorized_networks {
        value = "103.53.75.58"
      }
    }

    insights_config {
      query_insights_enabled  = true
      record_client_address   = true
      record_application_tags = true
      query_string_length     = 4096
    }
  }

  lifecycle {
    prevent_destroy = true
  }

  depends_on = [google_service_networking_connection.private_connection]
}

resource "google_sql_database" "prod_db" {
  name     = "prod_database"
  instance = google_sql_database_instance.prod_postgres_instance.name

  lifecycle {
    prevent_destroy = true
  }

  depends_on = [google_sql_database_instance.prod_postgres_instance]
}
