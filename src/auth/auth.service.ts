import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { timingSafeEqual } from 'node:crypto';
import type { LoginDto } from './dto/login.dto';
import type {
  AuthenticatedAdmin,
  JwtPayload,
  LoginResponse,
} from './auth.types';

@Injectable()
export class AuthService {
  constructor(
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
  ) {}

  login(dto: LoginDto): LoginResponse {
    const expectedUsername =
      this.configService.getOrThrow<string>('ADMIN_USERNAME');
    const expectedPassword =
      this.configService.getOrThrow<string>('ADMIN_PASSWORD');

    if (
      !this.secureEquals(dto.username, expectedUsername) ||
      !this.secureEquals(dto.password, expectedPassword)
    ) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload: JwtPayload = {
      sub: expectedUsername,
      username: expectedUsername,
      role: 'admin',
    };

    return {
      accessToken: this.jwtService.sign(payload),
      tokenType: 'Bearer',
      expiresIn: this.configService.getOrThrow<string>('JWT_EXPIRES_IN'),
    };
  }

  validatePayload(payload: JwtPayload): AuthenticatedAdmin {
    const expectedUsername =
      this.configService.getOrThrow<string>('ADMIN_USERNAME');

    if (
      payload.role !== 'admin' ||
      !this.secureEquals(payload.username, expectedUsername)
    ) {
      throw new UnauthorizedException('Invalid token');
    }

    return {
      username: expectedUsername,
      role: 'admin',
    };
  }

  private secureEquals(left: string, right: string): boolean {
    const leftBuffer = Buffer.from(left);
    const rightBuffer = Buffer.from(right);

    if (leftBuffer.length !== rightBuffer.length) {
      return false;
    }

    return timingSafeEqual(leftBuffer, rightBuffer);
  }
}
