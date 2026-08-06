import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { randomUUID } from 'node:crypto';
import { CreatePresignDto, UploadKind } from './dto/create-presign.dto';
import type { PresignUploadResponse } from './uploads.types';

const ALLOWED_CONTENT_TYPES: Record<UploadKind, readonly string[]> = {
  [UploadKind.Cover]: ['image/jpeg', 'image/png', 'image/webp'],
  [UploadKind.Pdf]: ['application/pdf'],
};

@Injectable()
export class UploadsService {
  private readonly s3Client: S3Client;

  constructor(private readonly configService: ConfigService) {
    this.s3Client = new S3Client({
      region: this.configService.getOrThrow<string>('AWS_REGION'),
    });
  }

  async createPresignedUpload(
    dto: CreatePresignDto,
  ): Promise<PresignUploadResponse> {
    this.assertAllowedContentType(dto.kind, dto.contentType);

    const expiresIn = this.configService.getOrThrow<number>(
      'UPLOAD_URL_EXPIRES_IN',
    );
    const bucket = this.configService.getOrThrow<string>('S3_ASSETS_BUCKET');
    const publicBaseUrl = this.configService
      .getOrThrow<string>('ASSETS_PUBLIC_BASE_URL')
      .replace(/\/$/, '');
    const objectKey = this.buildObjectKey(dto);
    const command = new PutObjectCommand({
      Bucket: bucket,
      Key: objectKey,
      ContentType: dto.contentType,
    });

    const uploadUrl = await getSignedUrl(this.s3Client, command, {
      expiresIn,
    });

    return {
      uploadUrl,
      objectKey,
      publicUrl: `${publicBaseUrl}/${objectKey}`,
      expiresIn,
      contentType: dto.contentType,
    };
  }

  assertAllowedContentType(kind: UploadKind, contentType: string): void {
    const allowed = ALLOWED_CONTENT_TYPES[kind];

    if (!allowed.includes(contentType)) {
      throw new BadRequestException(
        `contentType "${contentType}" is not allowed for ${kind} uploads`,
      );
    }
  }

  buildObjectKey(dto: CreatePresignDto): string {
    const projectSegment = dto.projectSlug ?? 'misc';
    const safeFileName = dto.fileName
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9._-]+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');

    if (!safeFileName) {
      throw new BadRequestException('fileName must contain usable characters');
    }

    return `projects/${projectSegment}/${dto.kind}/${randomUUID()}-${safeFileName}`;
  }
}
