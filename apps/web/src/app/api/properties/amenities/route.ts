import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

const API_BASE_URL = process.env.API_BASE_URL || 'http://rentify-api:3001/api';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    const token = (session as any)?.nestjsToken;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Debug logs
    if (!process.env.NODE_ENV || process.env.NODE_ENV === 'development') {
      console.log('[Amenities] Session exists:', !!session, 'Token exists:', !!token);
    }

    const response = await fetch(`${API_BASE_URL}/properties/amenities/list`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Failed to fetch amenities' },
        { status: response.status }
      );
    }

    const data = await response.json();
    if (!process.env.NODE_ENV || process.env.NODE_ENV === 'development') {
      console.log('[Amenities] Received count:', Array.isArray(data) ? data.length : 'n/a');
    }
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching amenities:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

