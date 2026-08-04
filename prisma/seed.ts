import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../src/generated/prisma/client';

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});
const prisma = new PrismaClient({ adapter });

async function main(): Promise<void> {
  const projects = [
    {
      slug: 'focusforge',
      title: 'FocusForge',
      summary:
        'Full-stack cognitive training app with React, NestJS, MongoDB, and AWS.',
      description:
        'Agile team project covering authentication UX, responsive UI, Docker packaging, and EC2 deployment.',
      tags: ['React', 'TypeScript', 'NestJS', 'MongoDB', 'AWS'],
      coverImageUrl: null,
      pdfUrl: null,
      published: true,
      sortOrder: 1,
    },
    {
      slug: 'grok-career-coach',
      title: 'Grok Career Coach',
      summary:
        'ASP.NET Core career-coaching API with JWT, PostgreSQL, Redis, and optional xAI Grok.',
      description:
        'Google sign-in, coaching session persistence, Redis response caching, and Docker Compose local stack.',
      tags: ['ASP.NET Core', 'PostgreSQL', 'Redis', 'Docker', 'Azure'],
      coverImageUrl: null,
      pdfUrl: null,
      published: true,
      sortOrder: 2,
    },
    {
      slug: 'aws-portfolio-ops',
      title: 'AWS Portfolio Ops',
      summary:
        'NestJS portfolio operations API with Prisma, PostgreSQL, and Terraform-ready AWS delivery.',
      description:
        'Public project read API, containerized local development, CI, and S3/CloudFront infrastructure as code.',
      tags: ['NestJS', 'Prisma', 'PostgreSQL', 'Terraform', 'AWS'],
      coverImageUrl: null,
      pdfUrl: null,
      published: true,
      sortOrder: 3,
    },
  ];

  for (const project of projects) {
    await prisma.project.upsert({
      where: { slug: project.slug },
      update: project,
      create: project,
    });
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error: unknown) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
