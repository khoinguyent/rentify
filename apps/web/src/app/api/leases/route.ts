import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

const API_BASE_URL = process.env.API_BASE_URL || 'http://rentify-api:3001/api';

export async function GET(request: NextRequest) {
  try {
    console.log('GET /api/leases - Starting request');
    const session = await getServerSession(authOptions);
    console.log('Session:', session ? 'exists' : 'missing');
    console.log('NestJS token:', (session as any)?.nestjsToken ? 'exists' : 'missing');

    if (!session || !(session as any).nestjsToken) {
      console.log('Unauthorized: missing session or nestjsToken');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Forward request to NestJS API
    console.log('Forwarding request to NestJS API...');
    const response = await fetch(`${API_BASE_URL}/leases`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${(session as any).nestjsToken}`,
      },
    });

    console.log('NestJS response status:', response.status);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: response.statusText }));
      console.error('NestJS API error:', errorData);
      return NextResponse.json(
        { error: errorData.message || 'Failed to fetch leases' },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log('Received leases data type:', typeof data);
    console.log('Received leases data:', JSON.stringify(data, null, 2).substring(0, 500));
    console.log('Is array?', Array.isArray(data));
    
    // Handle case where API returns an error object but with 200 status
    if (!Array.isArray(data)) {
      console.error('API returned non-array data:', data);
      return NextResponse.json([]);
    }
    
    console.log('Returning:', data.length, 'leases');
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching leases:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.nestjsToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();

    console.log('Creating lease with data:', body);

    // Forward request to NestJS API
    const response = await fetch(`${API_BASE_URL}/leases`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.nestjsToken}`,
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: response.statusText }));
      console.error('NestJS API error:', errorData);
      return NextResponse.json(
        { error: errorData.message || 'Failed to create lease' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error creating lease:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

