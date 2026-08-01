variable "aws_region" {
  description = "AWS region in which to create resources."
  type        = string
  default     = "ap-southeast-2"
}

variable "project_name" {
  description = "Name used to identify and tag project resources."
  type        = string
  default     = "aws-portfolio-ops"

  validation {
    condition     = can(regex("^[a-z0-9-]+$", var.project_name))
    error_message = "project_name must contain only lowercase letters, numbers, and hyphens."
  }
}

variable "environment" {
  description = "Deployment environment name."
  type        = string
  default     = "dev"

  validation {
    condition     = contains(["dev", "staging", "prod"], var.environment)
    error_message = "environment must be dev, staging, or prod."
  }
}

variable "github_repository" {
  description = "GitHub repository allowed to deploy the web application."
  type        = string
  default     = "Dingchen-Yuan/aws-portfolio-ops"

  validation {
    condition     = can(regex("^[A-Za-z0-9_.-]+/[A-Za-z0-9_.-]+$", var.github_repository))
    error_message = "github_repository must use the owner/repository format."
  }
}

variable "github_owner_id" {
  description = "Immutable numeric GitHub owner ID used in OIDC subject claims."
  type        = number
  default     = 244395969
}

variable "github_repository_id" {
  description = "Immutable numeric GitHub repository ID used in OIDC subject claims."
  type        = number
  default     = 1317255248
}

variable "cloudfront_price_class" {
  description = "CloudFront edge location price class."
  type        = string
  default     = "PriceClass_100"

  validation {
    condition = contains([
      "PriceClass_100",
      "PriceClass_200",
      "PriceClass_All",
    ], var.cloudfront_price_class)
    error_message = "cloudfront_price_class must be a valid CloudFront price class."
  }
}
