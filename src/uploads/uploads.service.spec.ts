import { BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UploadKind } from './dto/create-presign.dto';
import { UploadsService } from './uploads.service';

jest.mock('@aws-sdk/s3-request-presigner', () => ({
  getSignedUrl: jest.fn().mockResolvedValue('https://s3.example/presigned'),
}));

describe('UploadsService', () => {
  const configValues: Record<string, string | number> = {
    AWS_REGION: 'ap-southeast-2',
    S3_ASSETS_BUCKET: 'aws-portfolio-ops-dev-assets-example',
    ASSETS_PUBLIC_BASE_URL: 'https://example.cloudfront.net/',
    UPLOAD_URL_EXPIRES_IN: 300,
  };

  const configService = {
    getOrThrow: (key: string) => {
      const value = configValues[key];
      if (value === undefined) {
        throw new Error(`Missing config: ${key}`);
      }
      return value;
    },
  } as ConfigService;

  const service = new UploadsService(configService);

  it('builds a stable object key for project uploads', () => {
    const objectKey = service.buildObjectKey({
      kind: UploadKind.Cover,
      contentType: 'image/png',
      fileName: 'Hero Cover.PNG',
      projectSlug: 'aws-portfolio-ops',
    });

    expect(objectKey).toMatch(
      /^projects\/aws-portfolio-ops\/cover\/[0-9a-f-]+-hero-cover\.png$/,
    );
  });

  it('rejects unsupported content types', () => {
    expect(() =>
      service.assertAllowedContentType(UploadKind.Pdf, 'image/png'),
    ).toThrow(BadRequestException);
  });

  it('returns a presigned upload payload', async () => {
    await expect(
      service.createPresignedUpload({
        kind: UploadKind.Cover,
        contentType: 'image/jpeg',
        fileName: 'cover.jpg',
        projectSlug: 'focusforge',
      }),
    ).resolves.toEqual({
      uploadUrl: 'https://s3.example/presigned',
      objectKey: expect.stringMatching(
        /^projects\/focusforge\/cover\/[0-9a-f-]+-cover\.jpg$/,
      ) as string,
      publicUrl: expect.stringMatching(
        /^https:\/\/example\.cloudfront\.net\/projects\/focusforge\/cover\//,
      ) as string,
      expiresIn: 300,
      contentType: 'image/jpeg',
    });
  });
});
