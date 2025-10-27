import { Client } from 'minio';

export const minioClient = new Client({
  endPoint: process.env.MINIO_ENDPOINT || 'localhost',
  port: parseInt(process.env.MINIO_PORT || '9000'),
  useSSL: false,
  accessKey: process.env.MINIO_ACCESS_KEY || 'minioadmin',
  secretKey: process.env.MINIO_SECRET_KEY || 'minioadmin',
});

export async function uploadToMinio(file: Express.Multer.File, folder: string): Promise<string> {
  const bucket = process.env.MINIO_BUCKET || 'rentify-files';
  const objectName = `${folder}/${Date.now()}-${file.originalname}`;
  
  try {
    await minioClient.putObject(bucket, objectName, file.buffer, file.size, {
      'Content-Type': file.mimetype,
    });
    
    const publicUrl = process.env.MINIO_PUBLIC_URL || 'http://localhost:9000';
    return `${publicUrl}/${bucket}/${objectName}`;
  } catch (error) {
    console.error('Error uploading to MinIO:', error);
    throw new Error('Failed to upload file to MinIO');
  }
}

export async function deleteFromMinio(objectName: string): Promise<void> {
  const bucket = process.env.MINIO_BUCKET || 'rentify-files';
  
  try {
    await minioClient.removeObject(bucket, objectName);
  } catch (error) {
    console.error('Error deleting from MinIO:', error);
    throw new Error('Failed to delete file from MinIO');
  }
}

