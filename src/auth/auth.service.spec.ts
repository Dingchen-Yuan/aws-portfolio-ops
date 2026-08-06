import { UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  const configValues: Record<string, string> = {
    ADMIN_USERNAME: 'admin',
    ADMIN_PASSWORD: 'change-me-now',
    JWT_EXPIRES_IN: '1d',
  };

  const configService = {
    getOrThrow: (key: string) => {
      const value = configValues[key];
      if (!value) {
        throw new Error(`Missing config: ${key}`);
      }
      return value;
    },
  } as ConfigService;

  const jwtService = {
    sign: jest.fn().mockReturnValue('signed-token'),
  } as unknown as JwtService;

  const authService = new AuthService(configService, jwtService);

  it('returns a bearer token for valid credentials', () => {
    expect(
      authService.login({
        username: 'admin',
        password: 'change-me-now',
      }),
    ).toEqual({
      accessToken: 'signed-token',
      tokenType: 'Bearer',
      expiresIn: '1d',
    });
  });

  it('rejects invalid credentials', () => {
    expect(() =>
      authService.login({
        username: 'admin',
        password: 'wrong-password',
      }),
    ).toThrow(UnauthorizedException);
  });
});
