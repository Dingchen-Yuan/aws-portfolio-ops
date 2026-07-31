# Terraform

This configuration creates the project's private S3 asset bucket and a
least-privilege IAM policy that can be attached to the API's future runtime
role. It does not create an IAM user or access keys.

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
