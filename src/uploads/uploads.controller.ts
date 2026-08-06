import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreatePresignDto } from './dto/create-presign.dto';
import { UploadsService } from './uploads.service';
import type { PresignUploadResponse } from './uploads.types';

@Controller('admin/uploads')
@UseGuards(JwtAuthGuard)
export class UploadsController {
  constructor(private readonly uploadsService: UploadsService) {}

  @Post('presign')
  createPresign(@Body() dto: CreatePresignDto): Promise<PresignUploadResponse> {
    return this.uploadsService.createPresignedUpload(dto);
  }
}
