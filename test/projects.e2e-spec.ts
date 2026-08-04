import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

describe('Projects endpoint (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api');
    await app.init();
    prisma = app.get(PrismaService);

    await prisma.project.deleteMany();
    await prisma.project.create({
      data: {
        slug: 'focusforge',
        title: 'FocusForge',
        summary: 'Cognitive training app',
        description: 'Full-stack Agile team project.',
        tags: ['React', 'NestJS'],
        published: true,
        sortOrder: 1,
      },
    });
    await prisma.project.create({
      data: {
        slug: 'draft-only',
        title: 'Draft Only',
        summary: 'Should stay private',
        description: 'Unpublished project.',
        tags: ['Internal'],
        published: false,
        sortOrder: 99,
      },
    });
  });

  afterAll(async () => {
    await prisma.project.deleteMany();
    await app.close();
  });

  it('GET /api/projects returns published projects only', async () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    const response = await request(app.getHttpServer())
      .get('/api/projects')
      .expect(200);

    expect(response.body).toEqual([
      expect.objectContaining({
        slug: 'focusforge',
        title: 'FocusForge',
        published: true,
      }),
    ]);
  });

  it('GET /api/projects/:slug returns a published project', async () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    const response = await request(app.getHttpServer())
      .get('/api/projects/focusforge')
      .expect(200);

    expect(response.body).toEqual(
      expect.objectContaining({
        slug: 'focusforge',
        title: 'FocusForge',
      }),
    );
  });

  it('GET /api/projects/:slug returns 404 for missing or unpublished projects', async () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    await request(app.getHttpServer())
      .get('/api/projects/draft-only')
      .expect(404);

    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    await request(app.getHttpServer())
      .get('/api/projects/does-not-exist')
      .expect(404);
  });
});
