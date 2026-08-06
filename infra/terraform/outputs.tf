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

output "assets_distribution_id" {
  description = "ID of the CloudFront distribution serving portfolio assets."
  value       = aws_cloudfront_distribution.assets.id
}

output "assets_cdn_url" {
  description = "HTTPS base URL for publicly readable portfolio assets."
  value       = "https://${aws_cloudfront_distribution.assets.domain_name}"
}

output "web_bucket_name" {
  description = "Name of the private bucket containing the built React application."
  value       = aws_s3_bucket.web.id
}

output "web_distribution_id" {
  description = "ID of the CloudFront distribution serving the React application."
  value       = aws_cloudfront_distribution.web.id
}

output "web_url" {
  description = "HTTPS URL of the deployed React application."
  value       = "https://${aws_cloudfront_distribution.web.domain_name}"
}

output "github_web_deploy_role_arn" {
  description = "IAM role ARN for the GitHub Actions web deployment workflow."
  value       = aws_iam_role.github_web_deploy.arn
}
