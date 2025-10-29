export interface UploadResult {
  url: string;
  key: string;
  fileName: string;
  originalName: string;
  fileSize: number;
  mimeType: string;
}

export interface IStorageProvider {
  /**
   * Upload a single file to storage
   */
  uploadFile(
    file: Express.Multer.File,
    folder?: string,
  ): Promise<UploadResult>;

  /**
   * Upload multiple files to storage
   */
  uploadMultipleFiles(
    files: Express.Multer.File[],
    folder?: string,
  ): Promise<UploadResult[]>;

  /**
   * Delete a file from storage
   */
  deleteFile(objectName: string): Promise<void>;

  /**
   * Delete multiple files from storage
   */
  deleteMultipleFiles(objectNames: string[]): Promise<void>;

  /**
   * Get a public URL for a file
   */
  getFileUrl(objectName: string, expiry?: number): Promise<string>;

  /**
   * Get a presigned URL for a file (for private access)
   */
  getPresignedUrl(objectName: string, expiry?: number): Promise<string>;

  /**
   * List files in a folder
   */
  listFiles(folder?: string, prefix?: string): Promise<string[]>;

  /**
   * Check if a file exists
   */
  fileExists(objectName: string): Promise<boolean>;
}

