import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
} from 'class-validator';

export enum UploadKind {
  Cover = 'cover',
  Pdf = 'pdf',
}

export class CreatePresignDto {
  @IsEnum(UploadKind)
  kind!: UploadKind;

  @IsString()
  @IsNotEmpty()
  contentType!: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^[^\\/]+$/, {
    message: 'fileName must not contain path separators',
  })
  fileName!: string;

  @IsOptional()
  @IsString()
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
    message: 'projectSlug must be lowercase letters, numbers, and hyphens',
  })
  projectSlug?: string;
}
