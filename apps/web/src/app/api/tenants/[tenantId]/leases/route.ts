import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

const API_URL = process.env.API_BASE_URL || 'http://rentify-api:3001/api';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ tenantId: string }> }
) {
  try {
    const params = await context.params;
    const tenantId = params.tenantId;
    
    const session = await getServerSession(authOptions);
    
    if (!session || !(session as any).nestjsToken) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const response = await fetch(`${API_URL}/tenants/${tenantId}/leases`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${(session as any).nestjsToken}`,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('API Error:', response.status, errorText);
      return NextResponse.json(
        { error: 'Failed to fetch leases' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching leases:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

