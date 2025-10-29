import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3Client, PutObjectCommand, DeleteObjectCommand, DeleteObjectsCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { IStorageProvider, UploadResult } from './storage-provider.interface';

@Injectable()
export class S3StorageProvider implements IStorageProvider {
  private readonly logger = new Logger(S3StorageProvider.name);
  private s3Client: S3Client;
  private bucketName: string;
  private publicUrl: string;

  constructor(private configService: ConfigService) {
    this.s3Client = new S3Client({
      region: this.configService.get('AWS_REGION', 'us-east-1'),
      credentials: {
        accessKeyId: this.configService.get('AWS_ACCESS_KEY_ID') || '',
        secretAccessKey: this.configService.get('AWS_SECRET_ACCESS_KEY') || '',
      },
    });

    this.bucketName = this.configService.get('AWS_S3_BUCKET', '');
    this.publicUrl = this.configService.get('AWS_S3_PUBLIC_URL', '');
    
    if (!this.bucketName) {
      this.logger.warn('AWS S3 bucket name not configured');
    }
  }

  async uploadFile(file: Express.Multer.File, folder: string = 'general'): Promise<UploadResult> {
    try {
      const fileName = `${Date.now()}-${file.originalname}`;
      const objectName = `${folder}/${fileName}`;

      await this.s3Client.send(new PutObjectCommand({
        Bucket: this.bucketName,
        Key: objectName,
        Body: file.buffer,
        ContentType: file.mimetype,
      }));

      const url = await this.getFileUrl(objectName);
      this.logger.log(`File uploaded to S3: ${objectName}`);

      return {
        url,
        key: objectName,
        fileName,
        originalName: file.originalname,
        fileSize: file.size,
        mimeType: file.mimetype,
      };
    } catch (error) {
      this.logger.error('Failed to upload file to S3:', error);
      throw new Error('Failed to upload file');
    }
  }

  async uploadMultipleFiles(files: Express.Multer.File[], folder: string = 'general'): Promise<UploadResult[]> {
    const uploadPromises = files.map((file) => this.uploadFile(file, folder));
    return Promise.all(uploadPromises);
  }

  async deleteFile(objectName: string): Promise<void> {
    try {
      await this.s3Client.send(new DeleteObjectCommand({
        Bucket: this.bucketName,
        Key: objectName,
      }));
      this.logger.log(`File deleted from S3: ${objectName}`);
    } catch (error) {
      this.logger.error('Failed to delete file from S3:', error);
      throw new Error('Failed to delete file');
    }
  }

  async deleteMultipleFiles(objectNames: string[]): Promise<void> {
    try {
      await this.s3Client.send(new DeleteObjectsCommand({
        Bucket: this.bucketName,
        Delete: {
          Objects: objectNames.map(key => ({ Key: key })),
        },
      }));
      this.logger.log(`Files deleted from S3: ${objectNames.join(', ')}`);
    } catch (error) {
      this.logger.error('Failed to delete files from S3:', error);
      throw new Error('Failed to delete files');
    }
  }

  async getFileUrl(objectName: string, expiry: number = 7 * 24 * 60 * 60): Promise<string> {
    try {
      if (this.publicUrl) {
        return `${this.publicUrl}/${objectName}`;
      }
      // Return S3 public URL
      return `https://${this.bucketName}.s3.amazonaws.com/${objectName}`;
    } catch (error) {
      this.logger.error('Failed to get S3 file URL:', error);
      throw new Error('Failed to get file URL');
    }
  }

  async getPresignedUrl(objectName: string, expiry: number = 7 * 24 * 60 * 60): Promise<string> {
    try {
      const command = new GetObjectCommand({
        Bucket: this.bucketName,
        Key: objectName,
      });

      return await getSignedUrl(this.s3Client, command, { expiresIn: expiry });
    } catch (error) {
      this.logger.error('Failed to get presigned URL:', error);
      throw new Error('Failed to get presigned URL');
    }
  }

  async listFiles(folder: string = '', prefix: string = ''): Promise<string[]> {
    try {
      // Implement list files using S3 SDK
      return [];
    } catch (error) {
      this.logger.error('Failed to list files from S3:', error);
      throw new Error('Failed to list files');
    }
  }

  async fileExists(objectName: string): Promise<boolean> {
    try {
      // Implement file exists check using S3 SDK
      return true;
    } catch {
      return false;
    }
  }
}

