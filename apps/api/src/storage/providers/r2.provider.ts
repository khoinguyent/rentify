import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3Client, PutObjectCommand, DeleteObjectCommand, DeleteObjectsCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { IStorageProvider, UploadResult } from './storage-provider.interface';

@Injectable()
export class R2StorageProvider implements IStorageProvider {
  private readonly logger = new Logger(R2StorageProvider.name);
  private r2Client: S3Client;
  private bucketName: string;
  private publicUrl: string;

  constructor(private configService: ConfigService) {
    const accountId = this.configService.get('CLOUDFLARE_ACCOUNT_ID', '');
    
    this.r2Client = new S3Client({
      region: 'auto',
      endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: this.configService.get('CLOUDFLARE_R2_ACCESS_KEY_ID') || '',
        secretAccessKey: this.configService.get('CLOUDFLARE_R2_SECRET_ACCESS_KEY') || '',
      },
    });

    this.bucketName = this.configService.get('CLOUDFLARE_R2_BUCKET', '');
    this.publicUrl = this.configService.get('CLOUDFLARE_R2_PUBLIC_URL', '');
    
    if (!this.bucketName) {
      this.logger.warn('Cloudflare R2 bucket name not configured');
    }
  }

  async uploadFile(file: Express.Multer.File, folder: string = 'general'): Promise<UploadResult> {
    try {
      const fileName = `${Date.now()}-${file.originalname}`;
      const objectName = `${folder}/${fileName}`;

      await this.r2Client.send(new PutObjectCommand({
        Bucket: this.bucketName,
        Key: objectName,
        Body: file.buffer,
        ContentType: file.mimetype,
      }));

      const url = await this.getFileUrl(objectName);
      this.logger.log(`File uploaded to R2: ${objectName}`);

      return {
        url,
        key: objectName,
        fileName,
        originalName: file.originalname,
        fileSize: file.size,
        mimeType: file.mimetype,
      };
    } catch (error) {
      this.logger.error('Failed to upload file to R2:', error);
      throw new Error('Failed to upload file');
    }
  }

  async uploadMultipleFiles(files: Express.Multer.File[], folder: string = 'general'): Promise<UploadResult[]> {
    const uploadPromises = files.map((file) => this.uploadFile(file, folder));
    return Promise.all(uploadPromises);
  }

  async deleteFile(objectName: string): Promise<void> {
    try {
      await this.r2Client.send(new DeleteObjectCommand({
        Bucket: this.bucketName,
        Key: objectName,
      }));
      this.logger.log(`File deleted from R2: ${objectName}`);
    } catch (error) {
      this.logger.error('Failed to delete file from R2:', error);
      throw new Error('Failed to delete file');
    }
  }

  async deleteMultipleFiles(objectNames: string[]): Promise<void> {
    try {
      await this.r2Client.send(new DeleteObjectsCommand({
        Bucket: this.bucketName,
        Delete: {
          Objects: objectNames.map(key => ({ Key: key })),
        },
      }));
      this.logger.log(`Files deleted from R2: ${objectNames.join(', ')}`);
    } catch (error) {
      this.logger.error('Failed to delete files from R2:', error);
      throw new Error('Failed to delete files');
    }
  }

  async getFileUrl(objectName: string, expiry: number = 7 * 24 * 60 * 60): Promise<string> {
    try {
      if (this.publicUrl) {
        return `${this.publicUrl}/${objectName}`;
      }
      // Return R2 public URL
      return `https://${this.bucketName}.r2.dev/${objectName}`;
    } catch (error) {
      this.logger.error('Failed to get R2 file URL:', error);
      throw new Error('Failed to get file URL');
    }
  }

  async getPresignedUrl(objectName: string, expiry: number = 7 * 24 * 60 * 60): Promise<string> {
    try {
      const command = new GetObjectCommand({
        Bucket: this.bucketName,
        Key: objectName,
      });

      return await getSignedUrl(this.r2Client, command, { expiresIn: expiry });
    } catch (error) {
      this.logger.error('Failed to get R2 presigned URL:', error);
      throw new Error('Failed to get presigned URL');
    }
  }

  async listFiles(folder: string = '', prefix: string = ''): Promise<string[]> {
    try {
      // Implement list files using R2 SDK
      return [];
    } catch (error) {
      this.logger.error('Failed to list files from R2:', error);
      throw new Error('Failed to list files');
    }
  }

  async fileExists(objectName: string): Promise<boolean> {
    try {
      // Implement file exists check using R2 SDK
      return true;
    } catch {
      return false;
    }
  }
}

