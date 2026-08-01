# AWS Portfolio Ops

Cloud-backed portfolio operations API for managing and serving public portfolio
assets.

**Status:** In active development (MIT portfolio project)  
**Author:** [Dingchen (Barry) Yuan](https://github.com/Dingchen-Yuan)  
**Live portfolio:** https://dingchen-yuan.github.io

## Overview

This repository contains the public React portfolio and its operations API.
The foundation provides a Vite frontend, NestJS API, Prisma/PostgreSQL
connectivity, containerized local development, CI, and Terraform for private
S3 and CloudFront delivery. JWT-protected administration and portfolio business
APIs remain roadmap work.

## Current stack

- React 19, TypeScript, and Vite
- NestJS 11 and TypeScript
- Prisma 7 with PostgreSQL
- Docker and Docker Compose
- GitHub Actions
- Terraform with the AWS provider
- Jest and Supertest

## Project structure

```text
web/                 React and Vite public portfolio
src/                 NestJS application and shared Prisma module
prisma/              Prisma schema
test/                API end-to-end tests
infra/terraform/     S3, CloudFront, IAM, and GitHub OIDC
.github/workflows/   Continuous integration and web deployment
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

In a second terminal, start the React application:

```bash
cd web
cp .env.example .env
npm install
npm run dev
```

The web application is available at `http://localhost:5173`. The API health
endpoint is available at `GET http://localhost:3000/api/health`.

Run the checks locally:

```bash
npm run prisma:validate
npm run lint
npm test
npm run test:e2e
npm run build
cd web
npm run lint
npm test
npm run build
```

The end-to-end suite expects PostgreSQL to be available using `DATABASE_URL`.

## Docker

Build and run the web application, API, and PostgreSQL together:

```bash
docker compose up --build
```

Open `http://localhost:8080`. Both application images use multi-stage builds;
the React output is served by Nginx.

## Environment variables

- `NODE_ENV`: `development`, `test`, or `production`
- `PORT`: HTTP listen port, default `3000`
- `DATABASE_URL`: PostgreSQL connection URL
- `CORS_ORIGINS`: comma-separated frontend origins allowed by the API
- `VITE_API_BASE_URL`: browser-visible API base URL in `web/.env`

Copy `.env.example` for local development. Never commit database passwords, AWS
credentials, JWT secrets, or other production values.

## AWS infrastructure

The configuration in `infra/terraform` creates a private asset bucket, a
separate private web bucket, CloudFront delivery, and least-privilege IAM
permissions. GitHub Actions authenticates through OIDC, so no long-lived AWS
access key is required.

```bash
cd infra/terraform
cp terraform.tfvars.example terraform.tfvars
terraform init
terraform plan
terraform apply
```

Review the plan before applying it. Terraform state and real variable files are
ignored by Git. After applying, configure these GitHub repository variables
from the Terraform outputs:

- `AWS_REGION`
- `AWS_DEPLOY_ROLE_ARN`
- `WEB_BUCKET_NAME`
- `WEB_DISTRIBUTION_ID`
- `VITE_API_BASE_URL`

The example Terraform variables contain this repository's immutable GitHub
owner and repository IDs for secure OIDC authentication.

After CI succeeds on `main`, `deploy-web.yml` uploads `web/dist` to S3 and
invalidates CloudFront.

## Roadmap

- [x] NestJS, Prisma, PostgreSQL, and test scaffold
- [x] React, Vite, and frontend test scaffold
- [x] Docker image and local Compose environment
- [x] GitHub Actions checks for the API and web application
- [x] Terraform foundation for private S3, CloudFront, IAM, and GitHub OIDC
- [x] Automated frontend deployment workflow
- [ ] JWT-protected admin APIs
- [ ] Project metadata schema and public read API
- [ ] S3-backed PDF and image uploads
- [ ] RDS deployment
- [ ] CloudWatch logging

## Target architecture

```text
CloudFront ──▶ React ──GET──▶ Public API ──▶ PostgreSQL
Admin UI/curl ─────────JWT──▶ Admin API  ──▶ S3
                                        └──▶ CloudWatch
```

## License

MIT

---

# AWS Portfolio Ops（中文版）

这是一个用于管理和提供公开作品集资源的云端运维 API。

**状态：** 正在开发（MIT 许可的个人作品集项目）

**作者：** [Dingchen (Barry) Yuan](https://github.com/Dingchen-Yuan)

**在线作品集：** https://dingchen-yuan.github.io

## 项目简介

这个仓库同时包含 React 作品集前端脚手架和后台运维 API。目前已经具备 Vite
前端、NestJS API、Prisma/PostgreSQL 数据库连接、容器化本地开发环境、持续
集成，以及用于私有 S3 和 CloudFront 分发的 Terraform 配置。真正的作品集
页面、项目数据接口、JWT 管理员认证和文件上传功能仍在后续开发计划中。

## 当前进度

已经完成：

- React 前端基础页面和 API 健康状态检测
- NestJS 健康检查接口
- Prisma 和本地 PostgreSQL 连接
- 前端、API、数据库的 Docker Compose 环境
- 前后端自动检查、测试和构建
- S3、CloudFront、IAM 和 GitHub OIDC 的 Terraform 配置
- 前端自动部署工作流配置

尚未完成：

- 真正的个人作品集页面设计
- `Project` 数据模型和项目查询接口
- 管理员登录与 JWT 权限保护
- 项目新增、修改和删除
- 图片及 PDF 上传
- 在 AWS 账户中实际创建资源并完成首次部署

## 当前技术栈

- React 19、TypeScript 和 Vite
- NestJS 11 和 TypeScript
- Prisma 7 和 PostgreSQL
- Docker 和 Docker Compose
- GitHub Actions
- Terraform 和 AWS Provider
- Jest 和 Supertest

## 项目结构

```text
web/                 React 和 Vite 公开作品集
src/                 NestJS 应用和共享 Prisma 模块
prisma/              Prisma 数据库模型
test/                API 端到端测试
infra/terraform/     S3、CloudFront、IAM 和 GitHub OIDC
.github/workflows/   持续集成和前端部署
```

## 本地开发

需要安装 Node.js 24+、npm 和 Docker Desktop。

### 快速体验完整项目

打开 Docker Desktop，然后在仓库根目录执行：

```bash
docker compose up -d --build
```

启动完成后访问：

- 前端页面：`http://localhost:8080`
- API 健康检查：`http://localhost:3000/api/health`

### 分别运行前后端

打开 Docker Desktop，等待左下角显示 Docker Engine 正常运行，然后在项目
终端执行：

```bash
cp .env.example .env
npm install
docker compose up -d db
npm run prisma:generate
npm run start:dev
```

在第二个终端启动 React：

```bash
cd web
cp .env.example .env
npm install
npm run dev
```

前端地址是 `http://localhost:5173`，健康检查地址为
`GET http://localhost:3000/api/health`。

在本地运行项目检查：

```bash
npm run prisma:validate
npm run lint
npm test
npm run test:e2e
npm run build
cd web
npm run lint
npm test
npm run build
```

端到端测试需要 PostgreSQL 正常运行，并且 `DATABASE_URL` 配置正确。

## Docker

Docker Desktop 打开后，一般不需要在应用界面手动创建容器。请在项目终端使用
Docker Compose。

只启动数据库：

```bash
docker compose up -d db
```

启动前端、API 和数据库：

```bash
docker compose up --build
```

查看运行状态：

```bash
docker compose ps
```

停止容器：

```bash
docker compose down
```

如果还要删除本地数据库数据卷：

```bash
docker compose down -v
```

打开 `http://localhost:8080` 查看容器化前端。前后端均采用多阶段构建，React
静态文件由 Nginx 提供。

## 环境变量

- `NODE_ENV`：`development`、`test` 或 `production`
- `PORT`：HTTP 服务端口，默认是 `3000`
- `DATABASE_URL`：PostgreSQL 数据库连接地址
- `CORS_ORIGINS`：API 允许访问的前端来源，多个地址用逗号分隔
- `VITE_API_BASE_URL`：`web/.env` 中浏览器可访问的 API 地址

本地开发时请复制 `.env.example`。不要提交数据库密码、AWS 凭证、JWT 密钥或
其他生产环境配置。

## AWS 基础设施

`infra/terraform` 会创建私有资源存储桶、独立的私有前端存储桶、CloudFront 和
最小权限 IAM。GitHub Actions 使用 OIDC 登录 AWS，不需要长期 AWS Access Key。

目前只是完成了 Terraform 和部署工作流代码，并没有在 AWS 账户中实际创建这些
资源。执行 `terraform apply` 可能产生 AWS 费用，请先确认 AWS 账户、区域和
Terraform 计划。

```bash
cd infra/terraform
cp terraform.tfvars.example terraform.tfvars
terraform init
terraform plan
terraform apply
```

执行 `terraform apply` 前必须检查计划。Terraform 状态文件和真实变量文件不会
提交到 Git。应用完成后，根据 Terraform 输出配置这些 GitHub Repository
Variables：

- `AWS_REGION`
- `AWS_DEPLOY_ROLE_ARN`
- `WEB_BUCKET_NAME`
- `WEB_DISTRIBUTION_ID`
- `VITE_API_BASE_URL`

Terraform 示例变量已经包含当前仓库不可变的 GitHub owner ID 和 repository
ID，用于安全的 OIDC 身份验证。

`main` 分支 CI 成功后，`deploy-web.yml` 会把 `web/dist` 上传到 S3 并刷新
CloudFront。该流程只有在 AWS 资源已经创建并且 GitHub Variables 配置完成后才
能正常运行。

## 开发路线

- [x] NestJS、Prisma、PostgreSQL 和测试脚手架
- [x] React、Vite 和前端测试脚手架
- [x] Docker 镜像和本地 Compose 环境
- [x] API 和前端的 GitHub Actions 检查
- [x] 私有 S3、CloudFront、IAM 和 GitHub OIDC 的 Terraform 基础
- [x] 自动化前端部署工作流
- [ ] JWT 管理员 API
- [ ] 项目元数据模型和公开读取 API
- [ ] 使用 S3 存储 PDF 和图片
- [ ] RDS 部署
- [ ] CloudWatch 日志

## 目标架构

```text
CloudFront ──▶ React ──GET──▶ 公开 API ──▶ PostgreSQL
管理员/curl ──────────JWT──▶ 管理 API ──▶ S3
                                      └──▶ CloudWatch
```

## 许可证

MIT
