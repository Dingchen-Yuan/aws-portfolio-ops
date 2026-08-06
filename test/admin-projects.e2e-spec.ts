import { INestApplication, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

describe('Admin projects endpoints (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let accessToken: string;

  beforeAll(async () => {
    process.env.ADMIN_USERNAME ??= 'admin';
    process.env.ADMIN_PASSWORD ??= 'change-me-now';
    process.env.JWT_SECRET ??= 'replace-with-a-long-random-secret-key';
    process.env.JWT_EXPIRES_IN ??= '1d';
    process.env.AWS_REGION ??= 'ap-southeast-2';
    process.env.S3_ASSETS_BUCKET ??= 'aws-portfolio-ops-dev-assets-example';
    process.env.ASSETS_PUBLIC_BASE_URL ??= 'https://example.cloudfront.net';
    process.env.UPLOAD_URL_EXPIRES_IN ??= '300';
    process.env.AWS_ACCESS_KEY_ID ??= 'test';
    process.env.AWS_SECRET_ACCESS_KEY ??= 'test';

    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api');
    app.useGlobalPipes(
      new ValidationPipe({
        transform: true,
        whitelist: true,
        forbidNonWhitelisted: true,
      }),
    );
    await app.init();
    prisma = app.get(PrismaService);

    const username = app
      .get(ConfigService)
      .getOrThrow<string>('ADMIN_USERNAME');
    const password = app
      .get(ConfigService)
      .getOrThrow<string>('ADMIN_PASSWORD');

    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    const loginResponse = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ username, password })
      .expect(201);

    accessToken = (loginResponse.body as { accessToken: string }).accessToken;
    await prisma.project.deleteMany();
  });

  afterAll(async () => {
    await prisma.project.deleteMany();
    await app.close();
  });

  it('rejects admin project writes without a token', async () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    await request(app.getHttpServer())
      .post('/api/admin/projects')
      .send({
        slug: 'unauthorized-project',
        title: 'Unauthorized',
        summary: 'Should be blocked',
        description: 'This request has no JWT token.',
      })
      .expect(401);
  });

  it('creates, updates, lists, and deletes projects with a JWT', async () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    const createResponse = await request(app.getHttpServer())
      .post('/api/admin/projects')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        slug: 'admin-created-project',
        title: 'Admin Created Project',
        summary: 'Created through the protected admin API',
        description:
          'This project proves create, update, and delete flows work.',
        tags: ['NestJS', 'JWT'],
        published: false,
        sortOrder: 5,
      })
      .expect(201);

    const projectId = (createResponse.body as { id: string }).id;

    expect(createResponse.body).toEqual(
      expect.objectContaining({
        id: projectId,
        slug: 'admin-created-project',
        published: false,
      }),
    );

    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    await request(app.getHttpServer())
      .patch(`/api/admin/projects/${projectId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        published: true,
        title: 'Published Admin Project',
      })
      .expect(200)
      .expect(({ body }: { body: { title: string; published: boolean } }) => {
        expect(body.title).toBe('Published Admin Project');
        expect(body.published).toBe(true);
      });

    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    const listResponse = await request(app.getHttpServer())
      .get('/api/admin/projects')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    expect(listResponse.body).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: projectId,
          slug: 'admin-created-project',
        }),
      ]),
    );

    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    await request(app.getHttpServer())
      .get('/api/projects/admin-created-project')
      .expect(200);

    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    await request(app.getHttpServer())
      .delete(`/api/admin/projects/${projectId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(204);

    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    await request(app.getHttpServer())
      .get('/api/projects/admin-created-project')
      .expect(404);
  });
});
