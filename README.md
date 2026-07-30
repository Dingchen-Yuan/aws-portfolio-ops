# AWS Portfolio Ops

Cloud-backed portfolio operations API for managing and serving public portfolio assets.

**Status:** In active development (MIT portfolio project)  
**Author:** [Dingchen (Barry) Yuan](https://github.com/Dingchen-Yuan)  
**Live portfolio:** https://dingchen-yuan.github.io

---

## Overview

A lightweight **ops gateway** behind a personal site: JWT-protected admin APIs for uploading résumé/PDF and project metadata; public read APIs for GitHub Pages. Primary cloud platform is **AWS** (S3, CloudFront, and related services).

## Planned / target stack

| Layer | Technology |
|--------|------------|
| API | NestJS (TypeScript) |
| Auth | JWT (admin routes) |
| Data | PostgreSQL (RDS preferred) |
| Storage / CDN | AWS S3 + CloudFront |
| Containers | Docker |
| CI/CD | GitHub Actions |
| IaC | Terraform (S3 + IAM minimum) |
| Observability | CloudWatch logs |
| Consumer | GitHub Pages portfolio site |

## Features (roadmap)

- [x] Repository & architecture scaffold
- [ ] JWT-protected admin upload / metadata APIs
- [ ] PostgreSQL for project metadata
- [ ] S3 object storage for PDFs / images
- [ ] Public read-only JSON API for the portfolio site
- [ ] Docker image for the API
- [ ] GitHub Actions: lint → test → build
- [ ] Terraform for core AWS resources
- [ ] CloudWatch logging

## Architecture (target)

```text
GitHub Pages ──GET──▶ Public API ──▶ PostgreSQL
Admin UI/curl ──JWT──▶ Admin API ──▶ S3 (assets)
                              └── CloudWatch
```

## Local development

> Implementation is in progress. Commands below will apply once the NestJS app is added.

```bash
# coming soon
docker compose up --build
```

## Environment variables (planned)

See `.env.example` once the API scaffold lands. Never commit AWS keys or JWT secrets.

## CV / résumé blurb

> Building a NestJS portfolio ops API with JWT, PostgreSQL, S3/CloudFront, Docker, GitHub Actions, and Terraform on AWS.

## License

MIT
