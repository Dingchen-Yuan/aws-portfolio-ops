import { INestApplication, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Admin uploads endpoints (e2e)', () => {
  let app: INestApplication;
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
  });

  afterAll(async () => {
    await app.close();
  });

  it('rejects upload presign requests without a token', async () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    await request(app.getHttpServer())
      .post('/api/admin/uploads/presign')
      .send({
        kind: 'cover',
        contentType: 'image/png',
        fileName: 'cover.png',
      })
      .expect(401);
  });

  it('rejects unsupported content types', async () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    await request(app.getHttpServer())
      .post('/api/admin/uploads/presign')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        kind: 'pdf',
        contentType: 'image/png',
        fileName: 'resume.pdf',
      })
      .expect(400);
  });

  it('returns a presigned upload URL for valid requests', async () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    const response = await request(app.getHttpServer())
      .post('/api/admin/uploads/presign')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        kind: 'cover',
        contentType: 'image/png',
        fileName: 'cover.png',
        projectSlug: 'aws-portfolio-ops',
      })
      .expect(201);

    expect(response.body).toEqual({
      uploadUrl: expect.stringContaining('https://') as string,
      objectKey: expect.stringMatching(
        /^projects\/aws-portfolio-ops\/cover\/.+-cover\.png$/,
      ) as string,
      publicUrl: expect.stringMatching(
        /^https:\/\/example\.cloudfront\.net\/projects\/aws-portfolio-ops\/cover\//,
      ) as string,
      expiresIn: 300,
      contentType: 'image/png',
    });
  });
});
