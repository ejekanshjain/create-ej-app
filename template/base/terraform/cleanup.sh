gcloud run revisions list \
  --region=us-central1 \
  --format=json | \
  jq -r '.[] | select(.status.conditions[] | select(.type == "Active" and .status != "True")) | .metadata.name' | \
  sort -u | \
  xargs -I {} gcloud run revisions delete {} \
  --region=us-central1 --quiet

gcloud artifacts docker images list us-docker.pkg.dev/project-id/github/my-app --format=json --include-tags | jq -r '.[] | select((.tags // []) as $tags | ($tags | index("main") // -1) == -1 and ($tags | index("dev") // -1) == -1) | .version' | while read -r digest; do echo "Deleting image with digest: $digest"; gcloud artifacts docker images delete us-docker.pkg.dev/project-id/github/my-app@$digest --delete-tags --quiet || true; done
