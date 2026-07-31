# AWS Portfolio Ops

Cloud-backed portfolio operations API for managing and serving public portfolio
assets.

**Status:** In active development (MIT portfolio project)  
**Author:** [Dingchen (Barry) Yuan](https://github.com/Dingchen-Yuan)  
**Live portfolio:** https://dingchen-yuan.github.io

## Overview

This repository is the operations gateway behind a personal portfolio. The
current foundation provides a NestJS API, Prisma/PostgreSQL connectivity,
containerized local development, CI, and Terraform for private S3 storage.
JWT-protected administration and portfolio business APIs remain roadmap work.

## Current stack

- NestJS 11 and TypeScript
- Prisma 7 with PostgreSQL
- Docker and Docker Compose
- GitHub Actions
- Terraform with the AWS provider
- Jest and Supertest

## Project structure

```text
src/                 NestJS application and shared Prisma module
prisma/              Prisma schema
test/                End-to-end tests
infra/terraform/     S3 and IAM infrastructure
.github/workflows/   Continuous integration
```

## Local development

Requirements: Node.js 24+, npm, and Docker.

```bash
cp .env.example .env
npm install
docker compose up -d db
npm run prisma:generate
npm run start:dev
```

The health endpoint is available at `GET http://localhost:3000/api/health`.

Run the checks locally:

```bash
npm run prisma:validate
npm run lint
npm test
npm run test:e2e
npm run build
```

The end-to-end suite expects PostgreSQL to be available using `DATABASE_URL`.

## Docker

Build and run the API and PostgreSQL together:

```bash
docker compose up --build
```

The API image uses a multi-stage build and runs as an unprivileged user.

## Environment variables

- `NODE_ENV`: `development`, `test`, or `production`
- `PORT`: HTTP listen port, default `3000`
- `DATABASE_URL`: PostgreSQL connection URL

Copy `.env.example` for local development. Never commit database passwords, AWS
credentials, JWT secrets, or other production values.

## AWS infrastructure

The configuration in `infra/terraform` creates a private, versioned,
server-side encrypted S3 bucket and a least-privilege IAM policy for future API
asset access. It intentionally does not create IAM users, access keys,
CloudFront, or RDS.

```bash
cd infra/terraform
cp terraform.tfvars.example terraform.tfvars
terraform init
terraform plan
```

Review the plan before applying it. Terraform state and real variable files are
ignored by Git.

## Roadmap

- [x] NestJS, Prisma, PostgreSQL, and test scaffold
- [x] Docker image and local Compose environment
- [x] GitHub Actions checks: Prisma, lint, test, and build
- [x] Terraform foundation for private S3 and IAM
- [ ] JWT-protected admin APIs
- [ ] Project metadata schema and public read API
- [ ] S3-backed PDF and image uploads
- [ ] CloudFront distribution
- [ ] RDS deployment
- [ ] CloudWatch logging

## Target architecture

```text
GitHub Pages ──GET──▶ Public API ──▶ PostgreSQL
Admin UI/curl ──JWT──▶ Admin API ──▶ S3
                              └──▶ CloudWatch
```

## License

MIT
