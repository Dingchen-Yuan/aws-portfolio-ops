output "assets_bucket_name" {
  description = "Name of the private portfolio assets bucket."
  value       = aws_s3_bucket.assets.id
}

output "assets_bucket_arn" {
  description = "ARN of the private portfolio assets bucket."
  value       = aws_s3_bucket.assets.arn
}

output "assets_access_policy_arn" {
  description = "ARN of the IAM policy for API asset access."
  value       = aws_iam_policy.assets_access.arn
}
