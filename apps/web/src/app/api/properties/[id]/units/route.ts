import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

const API_URL = process.env.API_BASE_URL || 'http://rentify-api:3001/api';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const session = await getServerSession(authOptions);
    
    if (!session || !(session as any).nestjsToken) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const response = await fetch(`${API_URL}/units?propertyId=${params.id}`, {
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
        { error: 'Failed to fetch units' },
        { status: response.status }
      );
    }

    const data = await response.json();
    
    // Transform the data to match the expected format
    const transformedData = data.map((unit: any) => ({
      id: unit.id,
      name: unit.name,
      floor: Number.isFinite(unit.floor) ? Number(unit.floor) : (unit.floor === 0 ? 0 : null),
      bedrooms: unit.bedrooms || 0,
      bathrooms: unit.bathrooms || 0,
      area: Number(unit.sizeM2 ?? unit.areaSize ?? 0),
      price: Number(unit.rent ?? unit.price ?? 0),
      status: unit.status || 'AVAILABLE',
      thumbnailUrl: unit.images?.[0]?.url || undefined,
      amenities: unit.amenities || [],
    }));

    return NextResponse.json(transformedData);
  } catch (error) {
    console.error('Error fetching units:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

