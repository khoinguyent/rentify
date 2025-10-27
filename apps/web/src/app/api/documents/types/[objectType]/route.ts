import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

const API_BASE_URL = process.env.API_BASE_URL || 'http://rentify-api:3001/api';

export async function GET(
  request: NextRequest,
  { params }: { params: { objectType: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !(session as any).nestjsToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('Fetching document types for objectType:', params.objectType);
    const response = await fetch(
      `${API_BASE_URL}/documents/types/${params.objectType}`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${(session as any).nestjsToken}`,
        },
      }
    );

    console.log('Document types response status:', response.status);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: response.statusText }));
      console.error('Error fetching document types from API:', errorData);
      return NextResponse.json(
        { error: errorData.message || 'Failed to fetch document types' },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log('Document types data received:', data);
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching document types:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

