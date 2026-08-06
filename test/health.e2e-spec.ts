import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Health endpoint (e2e)', () => {
  let app: INestApplication;

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
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /api/health', async () => {
    // Nest exposes the adapter-specific HTTP server as `any`.
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    await request(app.getHttpServer())
      .get('/api/health')
      .expect(200)
      .expect(({ body }: { body: unknown }) => {
        expect(body).toEqual({
          status: 'ok',
          database: 'up',
          timestamp: expect.any(String) as string,
        });
      });
  });
});
