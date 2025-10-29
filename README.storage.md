# Rentify Object Storage Configuration

Rentify supports multiple storage providers for object storage. This document explains how to configure and use different storage backends.

## Supported Storage Providers

1. **MinIO** (default) - Self-hosted object storage
2. **AWS S3** - Amazon S3 cloud storage
3. **Cloudflare R2** - Cloudflare R2 object storage

## Quick Start

### 1. Configure Storage Provider

Copy the example environment file:

```bash
cp env.example .env
```

### 2. Choose Your Storage Provider

Edit `.env` and set the `STORAGE_PROVIDER` variable to one of:
- `minio` (default, self-hosted)
- `s3` (AWS S3)
- `r2` (Cloudflare R2)

### 3. Configure Provider-Specific Settings

#### MinIO (Default - Self-Hosted)

No additional setup required. Uses MinIO container from Docker Compose.

```env
STORAGE_PROVIDER=minio
MINIO_ENDPOINT=localhost
MINIO_PORT=9000
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin123
MINIO_BUCKET_NAME=rentify-files
MINIO_PUBLIC_URL=http://localhost:3000/api/images
```

**Access MinIO Console:**
- URL: http://localhost:9001
- Username: `minioadmin`
- Password: `minioadmin123`

#### AWS S3

```env
STORAGE_PROVIDER=s3
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your-access-key-id
AWS_SECRET_ACCESS_KEY=your-secret-access-key
AWS_S3_BUCKET=your-bucket-name
AWS_S3_PUBLIC_URL=your-cloudfront-or-custom-domain
```

**Required AWS Permissions:**
- `s3:PutObject`
- `s3:GetObject`
- `s3:DeleteObject`
- `s3:ListBucket`

#### Cloudflare R2

```env
STORAGE_PROVIDER=r2
CLOUDFLARE_ACCOUNT_ID=your-account-id
CLOUDFLARE_R2_ACCESS_KEY_ID=your-access-key-id
CLOUDFLARE_R2_SECRET_ACCESS_KEY=your-secret-access-key
CLOUDFLARE_R2_BUCKET=your-bucket-name
CLOUDFLARE_R2_PUBLIC_URL=https://your-bucket.r2.dev
```

**Required Cloudflare Permissions:**
- R2 API token with read/write permissions

### 4. Start Services

```bash
docker-compose up -d
```

The storage provider is automatically selected based on the `STORAGE_PROVIDER` environment variable.

## Architecture

### Storage Module Structure

```
apps/api/src/storage/
├── providers/
│   ├── storage-provider.interface.ts  # Base interface
│   ├── storage.factory.ts               # Provider factory
│   ├── minio.provider.ts               # MinIO implementation
│   ├── s3.provider.ts                  # AWS S3 implementation
│   └── r2.provider.ts                  # Cloudflare R2 implementation
├── storage.service.ts                  # Main service (uses factory)
├── storage.controller.ts               # API endpoints
└── storage.module.ts                  # NestJS module
```

### How It Works

1. **StorageFactory** selects the appropriate provider based on `STORAGE_PROVIDER` env var
2. **StorageService** delegates all operations to the selected provider
3. All providers implement `IStorageProvider` interface for consistency
4. Files are stored with their `fileUrl` tracked in the `object_documents` table

### Database Schema

The `ObjectDocument` model includes:

```prisma
model ObjectDocument {
  id             String   @id @default(cuid())
  objectType     String   // "Property", "Lease", "Unit", etc.
  objectId       String
  name           String
  url            String   // Legacy URL (for backwards compatibility)
  fileUrl        String?  // Direct storage provider URL
  mimeType       String
  size           Int?
  documentTypeId String?
  uploadedById   String?
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt
  
  @@index([objectType, objectId])
}
```

## API Endpoints

All storage operations are available through the `/api/storage` endpoints:

- `POST /api/storage/upload` - Upload a single file
- `POST /api/storage/upload-multiple` - Upload multiple files
- `GET /api/storage/url/:key` - Get public URL
- `GET /api/storage/presigned/:key` - Get presigned URL (for private files)
- `DELETE /api/storage/:key` - Delete a file
- `GET /api/storage/list` - List files

## Testing Storage Providers

### MinIO

MinIO runs in Docker with no additional setup:

```bash
# Access MinIO Console
open http://localhost:9001

# Default credentials:
# Username: minioadmin
# Password: minioadmin123
```

### AWS S3

1. Create an S3 bucket
2. Configure IAM user with appropriate permissions
3. Add credentials to `.env`
4. Set `STORAGE_PROVIDER=s3`

### Cloudflare R2

1. Create an R2 bucket in Cloudflare dashboard
2. Create an API token with R2 permissions
3. Add credentials to `.env`
4. Set `STORAGE_PROVIDER=r2`

## Migration Between Providers

To migrate from one provider to another:

1. Update `.env` with new provider credentials
2. Run migration script (to be implemented) to sync files
3. Update `STORAGE_PROVIDER` value
4. Restart services

## Troubleshooting

### MinIO Connection Issues

```bash
# Check MinIO container status
docker logs rentify-minio

# Test MinIO connectivity
curl http://localhost:9000/minio/health/live
```

### AWS S3 Issues

- Verify IAM permissions
- Check region configuration
- Ensure bucket exists and is accessible

### Cloudflare R2 Issues

- Verify account ID is correct
- Check API token has R2 permissions
- Ensure bucket exists in dashboard

## Production Considerations

### Security

- Never commit `.env` with credentials
- Use strong passwords for MinIO
- Rotate AWS/R2 API keys regularly
- Enable SSL/TLS in production (`MINIO_USE_SSL=true`)

### Performance

- Use CloudFront/CDN for S3 public URLs
- Enable R2 public access for faster serving
- Consider using presigned URLs for private content

### Backup

- Regular backups of MinIO data (`minio_data` volume)
- S3/R2 have built-in redundancy
- Consider versioning for critical documents

