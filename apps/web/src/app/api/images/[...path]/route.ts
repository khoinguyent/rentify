import { NextRequest, NextResponse } from 'next/server';

// For Docker containers, use 'rentify-minio' service name, for local dev use 'localhost'
const MINIO_URL = process.env.NODE_ENV === 'production' 
  ? 'http://rentify-minio:9000' 
  : process.env.MINIO_ENDPOINT || 'http://localhost:9000';
const MINIO_BUCKET = process.env.MINIO_BUCKET_NAME || 'rentify-files';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) {
  try {
    const params = await context.params;
    const imagePath = params.path.join('/');
    
    // Construct the MinIO URL - MinIO expects /bucket/path format
    const minioUrl = `${MINIO_URL}/${MINIO_BUCKET}/${imagePath}`;
    
    console.log(`Fetching image from MinIO: ${minioUrl}`);
    
    // Fetch the object from MinIO
    const response = await fetch(minioUrl);
    
    if (!response.ok) {
      console.error(`Image not found at path: ${imagePath}, URL: ${minioUrl}, Status: ${response.status}`);
      return NextResponse.json({ error: 'Image not found' }, { status: 404 });
    }
    
    // Get the image data
    const imageData = await response.arrayBuffer();
    
    // Get the content type from MinIO response
    const contentType = response.headers.get('content-type') || 'image/jpeg';
    
    // Return the image with proper headers
    return new NextResponse(imageData, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch (error) {
    console.error('Error fetching image from MinIO:', error);
    return NextResponse.json({ error: 'Failed to fetch image' }, { status: 500 });
  }
}

