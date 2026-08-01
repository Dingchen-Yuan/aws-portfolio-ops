# Terraform

This configuration creates:

- a private S3 asset bucket and API access policy;
- a separate private S3 bucket for the React build;
- a CloudFront distribution with private origin access;
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

After applying, add the output values to the matching GitHub repository
variables documented in the root README. The OIDC provider is account-wide; if
the AWS account already has the GitHub Actions provider, import it into this
Terraform state before applying.

The `github_owner_id` and `github_repository_id` variables use GitHub's
immutable OIDC subject format. Update both values when reusing this
configuration for another repository.
