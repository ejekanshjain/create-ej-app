echo "Starting pre.sh script..."

gcloud config set project project-id

gcloud auth application-default set-quota-project project-id

echo "Setting up Google Cloud SDK and enabling required APIs..."

gcloud services enable logging.googleapis.com monitoring.googleapis.com compute.googleapis.com run.googleapis.com artifactregistry.googleapis.com vpcaccess.googleapis.com cloudbuild.googleapis.com servicenetworking.googleapis.com networkconnectivity.googleapis.com certificatemanager.googleapis.com sql-component.googleapis.com storage-component.googleapis.com storage.googleapis.com cloudapis.googleapis.com secretmanager.googleapis.com

echo "Enabling APIs completed."

echo "Please manually create a db secret in Secret Manager with names in file secret.txt"

echo "Creating storage bucket for Terraform state..."

gcloud storage buckets create gs://project-id-tf-state --location=us

gcloud storage buckets update gs://project-id-tf-state --versioning

echo "Creating storage bucket for Terraform state completed."

echo "Please manually connect github repositories on cloud build repositories from here https://console.cloud.google.com/cloud-build/repositories/1st-gen"

echo "And then copy the service account (eg:- 123456-compute@developer.gserviceaccount.com) to vars terraform.tfvars file from this link https://console.cloud.google.com/iam-admin/iam"
