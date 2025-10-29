import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

const API_BASE_URL = process.env.API_BASE_URL || 'http://rentify-api:3001/api';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.nestjsToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const response = await fetch(`${API_BASE_URL}/properties/${params.id}`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.nestjsToken}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: response.statusText }));
      console.error('NestJS API error:', errorData);
      return NextResponse.json(
        { error: errorData.message || 'Failed to fetch property' },
        { status: response.status }
      );
    }

    const data = await response.json();
    
    // The backend already maps property.images to photos as an array of objects
    // Just ensure photos is an array for PropertyImageGallery component
    const transformedData = {
      ...data,
      photos: Array.isArray(data.photos) ? data.photos : [],
    };
    
    return NextResponse.json(transformedData);
  } catch (error) {
    console.error('Error fetching property:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.nestjsToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();

    // Whitelist fields expected by backend DTO and normalize types
    const payload: Record<string, any> = {};
    const copy = body || {};
    if (copy.name !== undefined) payload.name = String(copy.name);
    if (copy.address !== undefined) payload.address = String(copy.address);
    if (copy.city !== undefined) payload.city = copy.city || undefined;
    if (copy.state !== undefined) payload.state = copy.state || undefined;
    if (copy.country !== undefined) payload.country = copy.country || undefined;
    if (copy.latitude !== undefined) payload.latitude = copy.latitude === '' ? undefined : Number(copy.latitude);
    if (copy.longitude !== undefined) payload.longitude = copy.longitude === '' ? undefined : Number(copy.longitude);
    if (copy.rentalPrice !== undefined) payload.rentalPrice = copy.rentalPrice === '' ? undefined : Number(copy.rentalPrice);
    if (copy.furnishing !== undefined) payload.furnishing = copy.furnishing || undefined;
    if (copy.numBedrooms !== undefined) payload.numBedrooms = copy.numBedrooms === '' ? undefined : Number(copy.numBedrooms);
    if (copy.numBathrooms !== undefined) payload.numBathrooms = copy.numBathrooms === '' ? undefined : Number(copy.numBathrooms);
    if (copy.floorArea !== undefined) payload.floorArea = copy.floorArea === '' ? undefined : Number(copy.floorArea);
    if (copy.parkingSpaces !== undefined) payload.parkingSpaces = copy.parkingSpaces === '' ? undefined : Number(copy.parkingSpaces);
    if (copy.availableFrom !== undefined) payload.availableFrom = copy.availableFrom || undefined;
    if (copy.description !== undefined) payload.description = copy.description || undefined;
    if (copy.status !== undefined) payload.status = copy.status;
    if (copy.isMultiUnit !== undefined) payload.isMultiUnit = !!copy.isMultiUnit;
    if (copy.allowWholeRent !== undefined) payload.allowWholeRent = !!copy.allowWholeRent;
    if (copy.wholeRentPrice !== undefined) payload.wholeRentPrice = copy.wholeRentPrice === '' ? undefined : Number(copy.wholeRentPrice);
    if (Array.isArray(copy.amenities)) {
      // Normalize amenities: allow array of ids or names; filter to valid IDs only
      let selected: string[] = copy.amenities.map((x: any) => String(x));
      try {
        const amenRes = await fetch(`${API_BASE_URL}/properties/amenities/list`, {
          headers: {
            'Authorization': `Bearer ${session.nestjsToken}`,
          },
        });
        if (amenRes.ok) {
          const all = await amenRes.json(); // [{id,name,...}]
          const nameToId = new Map<string, string>(all.map((a: any) => [a.name, a.id]));
          const idSet = new Set(all.map((a: any) => a.id));
          selected = selected
            .map((v: string) => (idSet.has(v) ? v : (nameToId.get(v) || '')))
            .filter((v: string) => v);
        }
      } catch {}
      payload.amenities = selected;
    }

    const response = await fetch(`${API_BASE_URL}/properties/${params.id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.nestjsToken}`,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: response.statusText }));
      console.error('NestJS API error:', errorData);
      return NextResponse.json(
        { error: errorData.message || 'Failed to update property' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error updating property:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const response = await fetch(`${API_BASE_URL}/properties/${params.id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Failed to delete property' },
        { status: response.status }
      );
    }

    return NextResponse.json({ message: 'Property deleted successfully' });
  } catch (error) {
    console.error('Error deleting property:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

