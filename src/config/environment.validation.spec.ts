import { environmentValidationSchema } from './environment.validation';

const validEnvironment = {
  NODE_ENV: 'production',
  PORT: 3000,
  DATABASE_URL: 'postgresql://user:password@localhost:5432/portfolio',
  ADMIN_USERNAME: 'admin',
  ADMIN_PASSWORD: 'change-me-now',
  JWT_SECRET: 'replace-with-a-long-random-secret-key',
  S3_ASSETS_BUCKET: 'aws-portfolio-ops-dev-assets-example',
  ASSETS_PUBLIC_BASE_URL: 'https://example.cloudfront.net',
};

describe('environmentValidationSchema', () => {
  it('accepts an explicit production frontend origin', () => {
    const result = environmentValidationSchema.validate({
      ...validEnvironment,
      CORS_ORIGINS: 'https://portfolio.example.com',
    });

    expect(result.error).toBeUndefined();
  });

  it('rejects a wildcard production origin', () => {
    const result = environmentValidationSchema.validate({
      ...validEnvironment,
      CORS_ORIGINS: '*',
    });

    expect(result.error?.message).toContain(
      'CORS_ORIGINS cannot contain a wildcard in production',
    );
  });
});
