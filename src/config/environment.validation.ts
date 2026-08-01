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
});
