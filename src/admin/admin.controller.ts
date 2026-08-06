import { Controller, Get, UseGuards } from '@nestjs/common';
import { CurrentAdmin } from '../auth/current-admin.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import type { AuthenticatedAdmin } from '../auth/auth.types';

@Controller('admin')
@UseGuards(JwtAuthGuard)
export class AdminController {
  @Get('me')
  me(@CurrentAdmin() admin: AuthenticatedAdmin): AuthenticatedAdmin {
    return admin;
  }
}
