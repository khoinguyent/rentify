import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
const { prisma } = require('@rentify/db');

export async function GET(
  request: NextRequest,
  { params }: { params: { tenantId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const tenantUserId = params.tenantId;

    // Get tenant profile using userId
    const tenantProfile = await prisma.tenantProfile.findUnique({
      where: { userId: tenantUserId },
    });

    if (!tenantProfile) {
      return NextResponse.json({ error: 'Tenant profile not found' }, { status: 404 });
    }

    // Get active lease for this tenant
    const lease = await prisma.leaseContract.findFirst({
      where: {
        tenantId: tenantProfile.id,
        status: 'ACTIVE',
      },
      include: {
        property: true,
        unit: true,
        landlord: true,
      },
    });

    return NextResponse.json({
      lease: lease ? {
        id: lease.id,
        startDate: lease.startDate,
        endDate: lease.endDate,
        rentAmount: lease.rentAmount.toString(),
        depositAmount: lease.depositAmount.toString(),
        status: lease.status,
        property: lease.property ? {
          name: lease.property.name,
          address: lease.property.address,
        } : null,
        unit: lease.unit ? {
          name: lease.unit.name,
        } : null,
      } : null,
    });
  } catch (error) {
    console.error('Error fetching tenant data:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

