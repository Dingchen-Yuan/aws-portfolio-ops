import { ConfigService } from '@nestjs/config';
import request from 'supertest';
import { Test } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { AppModule } from '../src/app.module';

describe('Auth and admin endpoints (e2e)', () => {
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
    app.useGlobalPipes(
      new ValidationPipe({
        transform: true,
        whitelist: true,
        forbidNonWhitelisted: true,
      }),
    );
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('logs in and accesses the protected admin profile', async () => {
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

    expect(loginResponse.body).toEqual({
      accessToken: expect.any(String) as string,
      tokenType: 'Bearer',
      expiresIn: expect.any(String) as string,
    });

    const accessToken = (loginResponse.body as { accessToken: string })
      .accessToken;

    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    await request(app.getHttpServer())
      .get('/api/admin/me')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200)
      .expect({
        username,
        role: 'admin',
      });
  });

  it('rejects protected admin access without a token', async () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    await request(app.getHttpServer()).get('/api/admin/me').expect(401);
  });

  it('rejects invalid login credentials', async () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({
        username: 'admin',
        password: 'incorrect-password',
      })
      .expect(401)
      .expect(({ body }: { body: { message: string } }) => {
        expect(body.message).toBe('Invalid credentials');
      });
  });
});
