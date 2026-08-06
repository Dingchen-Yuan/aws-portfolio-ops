import Joi from 'joi';

export const environmentValidationSchema = Joi.object({
  NODE_ENV: Joi.string()
    .valid('development', 'test', 'production')
    .default('development'),
  PORT: Joi.number().port().default(3000),
  DATABASE_URL: Joi.string()
    .uri({ scheme: ['postgresql', 'postgres'] })
    .required(),
  CORS_ORIGINS: Joi.string()
    .default('http://localhost:5173,http://localhost:8080')
    .when('NODE_ENV', {
      is: 'production',
      then: Joi.string()
        .pattern(/^(?!.*(?:^|,)\s*\*\s*(?:,|$)).*$/)
        .message('CORS_ORIGINS cannot contain a wildcard in production'),
    }),
  ADMIN_USERNAME: Joi.string().min(3).required(),
  ADMIN_PASSWORD: Joi.string().min(8).required(),
  JWT_SECRET: Joi.string().min(32).required(),
  JWT_EXPIRES_IN: Joi.string().default('1d'),
  AWS_REGION: Joi.string().default('ap-southeast-2'),
  S3_ASSETS_BUCKET: Joi.string().min(3).required(),
  ASSETS_PUBLIC_BASE_URL: Joi.string()
    .uri({ scheme: ['https', 'http'] })
    .required(),
  UPLOAD_URL_EXPIRES_IN: Joi.number().integer().min(60).max(3600).default(300),
});
