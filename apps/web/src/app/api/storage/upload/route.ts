import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

const API_BASE_URL = process.env.API_BASE_URL || 'http://rentify-api:3001/api';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.nestjsToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const folder = formData.get('folder') as string || 'general';

    const response = await fetch(`${API_BASE_URL}/storage/upload?folder=${encodeURIComponent(folder)}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${session.nestjsToken}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: response.statusText }));
      console.error('Storage API error:', errorData);
      return NextResponse.json(
        { error: errorData.message || 'Failed to upload file' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error uploading file:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
