import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

const API_URL = process.env.API_BASE_URL || 'http://rentify-api:3001/api';

export async function GET(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const { id } = context.params;
    const session = await getServerSession(authOptions);

    if (!session || !(session as any).nestjsToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const response = await fetch(`${API_URL}/units/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${(session as any).nestjsToken}`,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('API Error:', response.status, errorText);
      return NextResponse.json({ error: 'Failed to fetch unit' }, { status: response.status });
    }

    const unit = await response.json();

    const activeLeaseRaw = Array.isArray(unit.leases)
      ? unit.leases.find((l: any) => l.status === 'ACTIVE') || null
      : null;

    const normalized = {
      id: unit.id,
      name: unit.name,
      floor: unit.floor ?? null,
      bedrooms: unit.bedrooms ?? 0,
      bathrooms: unit.bathrooms ?? 0,
      area: Number(unit.sizeM2 ?? unit.areaSize ?? 0),
      price: unit.rent ?? unit.price ?? 0,
      status: unit.status ?? 'AVAILABLE',
      images: unit.images || [],
      amenities: unit.amenities || [],
      property: unit.property || null,
      activeLease: activeLeaseRaw
        ? {
            id: activeLeaseRaw.id,
            startDate: activeLeaseRaw.startDate,
            endDate: activeLeaseRaw.endDate,
            rentAmount: Number(activeLeaseRaw.rentAmount ?? 0),
            status: activeLeaseRaw.status,
          }
        : null,
      activeTenant: activeLeaseRaw?.tenant
        ? {
            id: activeLeaseRaw.tenant.id,
            name: activeLeaseRaw.tenant.fullName,
            email: activeLeaseRaw.tenant.email,
            phone: activeLeaseRaw.tenant.phone,
          }
        : null,
    };

    return NextResponse.json(normalized);
  } catch (error) {
    console.error('Error fetching unit:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const { id } = context.params;
    const session = await getServerSession(authOptions);

    if (!session || !(session as any).nestjsToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();

    // Whitelist and normalize fields for backend DTO
    const payload: Record<string, any> = {};
    if (body.name !== undefined) payload.name = body.name;
    if (body.floor !== undefined) payload.floor = Number(body.floor);
    if (body.bedrooms !== undefined) payload.bedrooms = Number(body.bedrooms);
    if (body.bathrooms !== undefined) payload.bathrooms = Number(body.bathrooms);
    if (body.area !== undefined) payload.sizeM2 = Number(body.area); // map to sizeM2
    if (body.rent !== undefined) payload.rent = Math.max(0, Number(body.rent));
    if (body.status !== undefined) payload.status = body.status;
    if (body.amenities !== undefined) payload.amenities = body.amenities;

    const response = await fetch(`${API_URL}/units/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${(session as any).nestjsToken}`,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('API Error:', response.status, errorText);
      return NextResponse.json({ error: 'Failed to update unit', details: errorText }, { status: response.status });
    }

    const updated = await response.json();
    return NextResponse.json(updated);
  } catch (error) {
    console.error('Error updating unit:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}


