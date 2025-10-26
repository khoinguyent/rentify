import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

const API_BASE_URL = process.env.API_BASE_URL || 'http://rentify-api:3001/api';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string; imageId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.nestjsToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const response = await fetch(`${API_BASE_URL}/properties/${params.id}/images/${params.imageId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.nestjsToken}`,
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const error = await response.text();
      return NextResponse.json({ error }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error updating property image:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; imageId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.nestjsToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const response = await fetch(`${API_BASE_URL}/properties/${params.id}/images/${params.imageId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${session.nestjsToken}`,
      },
    });

    if (!response.ok) {
      const error = await response.text();
      return NextResponse.json({ error }, { status: response.status });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting property image:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
