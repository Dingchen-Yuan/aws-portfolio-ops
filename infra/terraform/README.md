# Terraform

This configuration creates:

- a private S3 asset bucket and API access policy;
- a CloudFront distribution for publicly readable assets via Origin Access Control;
- a separate private S3 bucket for the React build;
- a CloudFront distribution for the web application;
- a GitHub OIDC role for least-privilege frontend deployments.

It does not create an IAM user or long-lived access key.

## Usage

```bash
cp terraform.tfvars.example terraform.tfvars
terraform init
terraform plan
terraform apply
```

Authenticate Terraform using an AWS profile, workload identity, or another
standard AWS provider credential source. Do not store credentials or state in
this repository.

After applying, map Terraform outputs to API environment variables:

- `S3_ASSETS_BUCKET` <- `assets_bucket_name`
- `ASSETS_PUBLIC_BASE_URL` <- `assets_cdn_url`
- `AWS_REGION` <- your chosen region

Also add the matching GitHub repository variables documented in the root README.
The OIDC provider is account-wide; if the AWS account already has the GitHub
Actions provider, import it into this Terraform state before applying.

The `github_owner_id` and `github_repository_id` variables use GitHub's
immutable OIDC subject format. Update both values when reusing this
configuration for another repository.
