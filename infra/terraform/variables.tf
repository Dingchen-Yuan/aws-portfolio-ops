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
