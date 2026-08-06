export interface PresignUploadResponse {
  uploadUrl: string;
  objectKey: string;
  publicUrl: string;
  expiresIn: number;
  contentType: string;
}
