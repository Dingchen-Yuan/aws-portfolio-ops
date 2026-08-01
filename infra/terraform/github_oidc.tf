resource "aws_iam_openid_connect_provider" "github" {
  url            = "https://token.actions.githubusercontent.com"
  client_id_list = ["sts.amazonaws.com"]
}

data "aws_iam_policy_document" "github_web_deploy_assume_role" {
  statement {
    actions = ["sts:AssumeRoleWithWebIdentity"]

    principals {
      type        = "Federated"
      identifiers = [aws_iam_openid_connect_provider.github.arn]
    }

    condition {
      test     = "StringEquals"
      variable = "token.actions.githubusercontent.com:aud"
      values   = ["sts.amazonaws.com"]
    }

    condition {
      test     = "StringEquals"
      variable = "token.actions.githubusercontent.com:sub"
      values = [
        "repo:${split("/", var.github_repository)[0]}@${var.github_owner_id}/${split("/", var.github_repository)[1]}@${var.github_repository_id}:ref:refs/heads/main",
      ]
    }
  }
}

resource "aws_iam_role" "github_web_deploy" {
  name_prefix        = "${var.project_name}-${var.environment}-web-deploy-"
  description        = "Allows the main branch GitHub workflow to deploy the web application."
  assume_role_policy = data.aws_iam_policy_document.github_web_deploy_assume_role.json
}

data "aws_iam_policy_document" "github_web_deploy" {
  statement {
    sid       = "ReadWebBucket"
    actions   = ["s3:GetBucketLocation", "s3:ListBucket"]
    resources = [aws_s3_bucket.web.arn]
  }

  statement {
    sid = "DeployWebObjects"
    actions = [
      "s3:DeleteObject",
      "s3:GetObject",
      "s3:PutObject",
    ]
    resources = ["${aws_s3_bucket.web.arn}/*"]
  }

  statement {
    sid       = "InvalidateWebDistribution"
    actions   = ["cloudfront:CreateInvalidation"]
    resources = [aws_cloudfront_distribution.web.arn]
  }
}

resource "aws_iam_role_policy" "github_web_deploy" {
  name_prefix = "${var.project_name}-${var.environment}-web-deploy-"
  role        = aws_iam_role.github_web_deploy.id
  policy      = data.aws_iam_policy_document.github_web_deploy.json
}
