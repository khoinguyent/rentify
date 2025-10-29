import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as Minio from 'minio';
import { IStorageProvider, UploadResult } from './storage-provider.interface';

@Injectable()
export class MinioStorageProvider implements IStorageProvider {
  private readonly logger = new Logger(MinioStorageProvider.name);
  private minioClient: Minio.Client;
  private bucketName: string;
  private publicUrl: string;

  constructor(private configService: ConfigService) {
    const internalEndpoint = this.configService.get('MINIO_ENDPOINT', 'minio');
    
    this.minioClient = new Minio.Client({
      endPoint: internalEndpoint,
      port: parseInt(this.configService.get('MINIO_PORT', '9000')),
      useSSL: this.configService.get('MINIO_USE_SSL', 'false') === 'true',
      accessKey: this.configService.get('MINIO_ACCESS_KEY', 'minioadmin'),
      secretKey: this.configService.get('MINIO_SECRET_KEY', 'minioadmin123'),
    });

    this.bucketName = this.configService.get('MINIO_BUCKET_NAME', 'rentify-files');
    this.publicUrl = this.configService.get('MINIO_PUBLIC_URL', 'http://localhost:3000/api/images');
    
    this.initializeBucket();
  }

  private async initializeBucket() {
    try {
      const bucketExists = await this.minioClient.bucketExists(this.bucketName);
      if (!bucketExists) {
        await this.minioClient.makeBucket(this.bucketName, 'us-east-1');
        this.logger.log(`Created bucket: ${this.bucketName}`);
      }
      
      await this.setPublicReadPolicy();
    } catch (error) {
      this.logger.error('Failed to initialize bucket:', error);
    }
  }

  private async setPublicReadPolicy() {
    try {
      const policy = {
        Version: '2012-10-17',
        Statement: [{
          Effect: 'Allow',
          Principal: '*',
          Action: ['s3:GetObject'],
          Resource: [`arn:aws:s3:::${this.bucketName}/*`],
        }],
      };

      await this.minioClient.setBucketPolicy(this.bucketName, JSON.stringify(policy));
      this.logger.log(`Set public read policy for bucket: ${this.bucketName}`);
    } catch (error) {
      this.logger.error('Failed to set bucket policy:', error);
    }
  }

  async uploadFile(file: Express.Multer.File, folder: string = 'general'): Promise<UploadResult> {
    try {
      const fileName = `${Date.now()}-${file.originalname}`;
      const objectName = `${folder}/${fileName}`;

      await this.minioClient.putObject(
        this.bucketName,
        objectName,
        file.buffer,
        file.size,
        { 'Content-Type': file.mimetype },
      );

      const url = await this.getFileUrl(objectName);
      this.logger.log(`File uploaded successfully: ${objectName}`);

      return {
        url,
        key: objectName,
        fileName,
        originalName: file.originalname,
        fileSize: file.size,
        mimeType: file.mimetype,
      };
    } catch (error) {
      this.logger.error('Failed to upload file:', error);
      throw new Error('Failed to upload file');
    }
  }

  async uploadMultipleFiles(files: Express.Multer.File[], folder: string = 'general'): Promise<UploadResult[]> {
    const uploadPromises = files.map((file) => this.uploadFile(file, folder));
    return Promise.all(uploadPromises);
  }

  async deleteFile(objectName: string): Promise<void> {
    try {
      await this.minioClient.removeObject(this.bucketName, objectName);
      this.logger.log(`File deleted successfully: ${objectName}`);
    } catch (error) {
      this.logger.error('Failed to delete file:', error);
      throw new Error('Failed to delete file');
    }
  }

  async deleteMultipleFiles(objectNames: string[]): Promise<void> {
    try {
      await this.minioClient.removeObjects(this.bucketName, objectNames);
      this.logger.log(`Files deleted successfully: ${objectNames.join(', ')}`);
    } catch (error) {
      this.logger.error('Failed to delete files:', error);
      throw new Error('Failed to delete files');
    }
  }

  async getFileUrl(objectName: string, expiry: number = 7 * 24 * 60 * 60): Promise<string> {
    try {
      // Return a URL proxied through Next.js
      return `${this.publicUrl}/${objectName}`;
    } catch (error) {
      this.logger.error('Failed to get file URL:', error);
      throw new Error('Failed to get file URL');
    }
  }

  async getPresignedUrl(objectName: string, expiry: number = 7 * 24 * 60 * 60): Promise<string> {
    try {
      return await this.minioClient.presignedGetObject(this.bucketName, objectName, expiry);
    } catch (error) {
      this.logger.error('Failed to get presigned URL:', error);
      throw new Error('Failed to get presigned URL');
    }
  }

  async listFiles(folder: string = '', prefix: string = ''): Promise<string[]> {
    try {
      const objectsList: string[] = [];
      const stream = this.minioClient.listObjects(this.bucketName, `${folder}/${prefix}`, true);
      
      return new Promise((resolve, reject) => {
        stream.on('data', (obj) => {
          if (obj.name) objectsList.push(obj.name);
        });
        stream.on('end', () => resolve(objectsList));
        stream.on('error', reject);
      });
    } catch (error) {
      this.logger.error('Failed to list files:', error);
      throw new Error('Failed to list files');
    }
  }

  async fileExists(objectName: string): Promise<boolean> {
    try {
      await this.minioClient.statObject(this.bucketName, objectName);
      return true;
    } catch {
      return false;
    }
  }
}

