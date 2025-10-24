import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@rentify.com' },
    update: {},
    create: {
      email: 'admin@rentify.com',
      passwordHash: adminPassword,
      firstName: 'Admin',
      lastName: 'User',
      role: 'ADMIN',
      emailVerified: new Date(),
    },
  });

  console.log('✅ Created admin user:', admin.email);

  // Create landlord user
  const landlordPassword = await bcrypt.hash('landlord123', 10);
  const landlordUser = await prisma.user.upsert({
    where: { email: 'landlord@rentify.com' },
    update: {},
    create: {
      email: 'landlord@rentify.com',
      passwordHash: landlordPassword,
      firstName: 'John',
      lastName: 'Landlord',
      role: 'LANDLORD',
      emailVerified: new Date(),
    },
  });

  const landlordProfile = await prisma.landlordProfile.upsert({
    where: { userId: landlordUser.id },
    update: {},
    create: {
      userId: landlordUser.id,
      name: 'John Landlord Properties LLC',
      phone: '+1-555-0100',
      address: '123 Main St, New York, NY 10001',
      taxId: 'TAX123456789',
    },
  });

  console.log('✅ Created landlord:', landlordProfile.name);

  // Create tenant user
  const tenantPassword = await bcrypt.hash('tenant123', 10);
  const tenantUser = await prisma.user.upsert({
    where: { email: 'tenant@rentify.com' },
    update: {},
    create: {
      email: 'tenant@rentify.com',
      passwordHash: tenantPassword,
      firstName: 'Jane',
      lastName: 'Tenant',
      role: 'TENANT',
      emailVerified: new Date(),
    },
  });

  const tenantProfile = await prisma.tenantProfile.upsert({
    where: { userId: tenantUser.id },
    update: {},
    create: {
      userId: tenantUser.id,
      fullName: 'Jane Tenant',
      email: 'tenant@rentify.com',
      phone: '+1-555-0200',
    },
  });

  console.log('✅ Created tenant:', tenantProfile.fullName);

  // Create amenities
  const amenities = await Promise.all([
    prisma.amenity.upsert({
      where: { name: 'Parking' },
      update: {},
      create: { name: 'Parking', description: 'On-site parking available', icon: '🅿️' },
    }),
    prisma.amenity.upsert({
      where: { name: 'Swimming Pool' },
      update: {},
      create: { name: 'Swimming Pool', description: 'Outdoor swimming pool', icon: '🏊' },
    }),
    prisma.amenity.upsert({
      where: { name: 'Gym' },
      update: {},
      create: { name: 'Gym', description: 'Fitness center', icon: '💪' },
    }),
    prisma.amenity.upsert({
      where: { name: 'Pet Friendly' },
      update: {},
      create: { name: 'Pet Friendly', description: 'Pets allowed', icon: '🐕' },
    }),
    prisma.amenity.upsert({
      where: { name: 'Hot Water Machine' },
      update: {},
      create: { name: 'Hot Water Machine', description: 'Instant hot water dispenser', icon: '♨️' },
    }),
    prisma.amenity.upsert({
      where: { name: 'Air Conditioner' },
      update: {},
      create: { name: 'Air Conditioner', description: 'Central air conditioning', icon: '❄️' },
    }),
    prisma.amenity.upsert({
      where: { name: 'Refrigerator' },
      update: {},
      create: { name: 'Refrigerator', description: 'Full-size refrigerator included', icon: '🧊' },
    }),
    prisma.amenity.upsert({
      where: { name: 'Television' },
      update: {},
      create: { name: 'Television', description: 'Smart TV with streaming capabilities', icon: '📺' },
    }),
    prisma.amenity.upsert({
      where: { name: 'WiFi' },
      update: {},
      create: { name: 'WiFi', description: 'High-speed internet included', icon: '📶' },
    }),
    prisma.amenity.upsert({
      where: { name: 'Washing Machine' },
      update: {},
      create: { name: 'Washing Machine', description: 'In-unit washer and dryer', icon: '🧺' },
    }),
  ]);

  console.log('✅ Created amenities:', amenities.length);

  // Create a property
  const property = await prisma.property.create({
    data: {
      landlordId: landlordProfile.id,
      name: 'Sunset Apartments',
      type: 'APARTMENT',
      address: '456 Oak Avenue',
      city: 'San Francisco',
      state: 'CA',
      zipCode: '94102',
      country: 'US',
      description: 'Modern apartments in the heart of the city',
      totalUnits: 5,
      yearBuilt: 2018,
      status: 'AVAILABLE',
      hasMultipleUnits: true,
      photos: [],
      tags: [],
    },
  });

  console.log('✅ Created property:', property.name);

  // Create second property
  const property2 = await prisma.property.create({
    data: {
      landlordId: landlordProfile.id,
      name: 'Downtown Plaza',
      type: 'APARTMENT',
      address: '789 Market Street',
      city: 'San Francisco',
      state: 'CA',
      zipCode: '94103',
      country: 'US',
      description: 'Luxury apartments with premium amenities',
      totalUnits: 8,
      yearBuilt: 2020,
      status: 'AVAILABLE',
      hasMultipleUnits: true,
      photos: [],
      tags: [],
    },
  });

  console.log('✅ Created second property:', property2.name);

  // Create third property
  const property3 = await prisma.property.create({
    data: {
      landlordId: landlordProfile.id,
      name: 'Garden Heights',
      type: 'HOUSE',
      address: '321 Pine Street',
      city: 'San Francisco',
      state: 'CA',
      zipCode: '94104',
      country: 'US',
      description: 'Charming houses with private gardens',
      totalUnits: 3,
      yearBuilt: 2015,
      status: 'AVAILABLE',
      hasMultipleUnits: true,
      photos: [],
      tags: [],
    },
  });

  console.log('✅ Created third property:', property3.name);

  // Link amenities to properties
  // Sunset Apartments - basic amenities
  await Promise.all(
    amenities.slice(0, 4).map((amenity) =>
      prisma.propertyAmenity.create({
        data: {
          propertyId: property.id,
          amenityId: amenity.id,
        },
      })
    )
  );

  // Downtown Plaza - premium amenities
  await Promise.all(
    amenities.slice(4, 10).map((amenity) =>
      prisma.propertyAmenity.create({
        data: {
          propertyId: property2.id,
          amenityId: amenity.id,
        },
      })
    )
  );

  // Garden Heights - mixed amenities
  await Promise.all([
    prisma.propertyAmenity.create({
      data: {
        propertyId: property3.id,
        amenityId: amenities[0].id, // Parking
      },
    }),
    prisma.propertyAmenity.create({
      data: {
        propertyId: property3.id,
        amenityId: amenities[3].id, // Pet Friendly
      },
    }),
    prisma.propertyAmenity.create({
      data: {
        propertyId: property3.id,
        amenityId: amenities[5].id, // Air Conditioner
      },
    }),
    prisma.propertyAmenity.create({
      data: {
        propertyId: property3.id,
        amenityId: amenities[6].id, // Refrigerator
      },
    }),
  ]);

  // Create units for Sunset Apartments (5 units)
  const sunsetUnits = await Promise.all([
    prisma.unit.create({
      data: {
        propertyId: property.id,
        name: 'Unit 101',
        floor: 1,
        rent: 2500,
        bedrooms: 2,
        bathrooms: 1,
        sizeM2: 75,
        photos: [],
        status: 'AVAILABLE',
        description: 'Spacious 2-bedroom apartment with city view',
      },
    }),
    prisma.unit.create({
      data: {
        propertyId: property.id,
        name: 'Unit 102',
        floor: 1,
        rent: 2200,
        bedrooms: 1,
        bathrooms: 1,
        sizeM2: 65,
        photos: [],
        status: 'AVAILABLE',
        description: 'Cozy 1-bedroom apartment',
      },
    }),
    prisma.unit.create({
      data: {
        propertyId: property.id,
        name: 'Unit 201',
        floor: 2,
        rent: 3000,
        bedrooms: 3,
        bathrooms: 2,
        sizeM2: 95,
        photos: [],
        status: 'OCCUPIED',
        description: 'Luxury 3-bedroom apartment with balcony',
      },
    }),
    prisma.unit.create({
      data: {
        propertyId: property.id,
        name: 'Unit 202',
        floor: 2,
        rent: 2800,
        bedrooms: 2,
        bathrooms: 2,
        sizeM2: 85,
        photos: [],
        status: 'AVAILABLE',
        description: 'Modern 2-bedroom apartment',
      },
    }),
    prisma.unit.create({
      data: {
        propertyId: property.id,
        name: 'Unit 301',
        floor: 3,
        rent: 3200,
        bedrooms: 3,
        bathrooms: 2,
        sizeM2: 100,
        photos: [],
        status: 'AVAILABLE',
        description: 'Penthouse-style 3-bedroom apartment',
      },
    }),
  ]);

  // Create units for Downtown Plaza (8 units)
  const downtownUnits = await Promise.all([
    prisma.unit.create({
      data: {
        propertyId: property2.id,
        name: 'Unit A101',
        floor: 1,
        rent: 3500,
        bedrooms: 2,
        bathrooms: 2,
        sizeM2: 85,
        photos: [],
        status: 'OCCUPIED',
        description: 'Premium 2-bedroom with smart home features',
      },
    }),
    prisma.unit.create({
      data: {
        propertyId: property2.id,
        name: 'Unit A102',
        floor: 1,
        rent: 3200,
        bedrooms: 2,
        bathrooms: 1,
        sizeM2: 75,
        photos: [],
        status: 'AVAILABLE',
        description: 'Modern 2-bedroom apartment',
      },
    }),
    prisma.unit.create({
      data: {
        propertyId: property2.id,
        name: 'Unit A201',
        floor: 2,
        rent: 4000,
        bedrooms: 3,
        bathrooms: 2,
        sizeM2: 110,
        photos: [],
        status: 'OCCUPIED',
        description: 'Luxury 3-bedroom with premium amenities',
      },
    }),
    prisma.unit.create({
      data: {
        propertyId: property2.id,
        name: 'Unit A202',
        floor: 2,
        rent: 3800,
        bedrooms: 3,
        bathrooms: 2,
        sizeM2: 95,
        photos: [],
        status: 'AVAILABLE',
        description: 'Spacious 3-bedroom apartment',
      },
    }),
    prisma.unit.create({
      data: {
        propertyId: property2.id,
        name: 'Unit A301',
        floor: 3,
        rent: 4500,
        bedrooms: 3,
        bathrooms: 3,
        sizeM2: 120,
        photos: [],
        status: 'AVAILABLE',
        description: 'Penthouse 3-bedroom with panoramic views',
      },
    }),
    prisma.unit.create({
      data: {
        propertyId: property2.id,
        name: 'Unit A302',
        floor: 3,
        rent: 4200,
        bedrooms: 3,
        bathrooms: 2,
        sizeM2: 105,
        photos: [],
        status: 'AVAILABLE',
        description: 'High-end 3-bedroom apartment',
      },
    }),
    prisma.unit.create({
      data: {
        propertyId: property2.id,
        name: 'Unit A401',
        floor: 4,
        rent: 4800,
        bedrooms: 4,
        bathrooms: 3,
        sizeM2: 130,
        photos: [],
        status: 'AVAILABLE',
        description: 'Executive 4-bedroom apartment',
      },
    }),
    prisma.unit.create({
      data: {
        propertyId: property2.id,
        name: 'Unit A402',
        floor: 4,
        rent: 4600,
        bedrooms: 4,
        bathrooms: 3,
        sizeM2: 125,
        photos: [],
        status: 'AVAILABLE',
        description: 'Premium 4-bedroom apartment',
      },
    }),
  ]);

  // Create units for Garden Heights (3 units)
  const gardenUnits = await Promise.all([
    prisma.unit.create({
      data: {
        propertyId: property3.id,
        name: 'House 1',
        floor: 1,
        rent: 2800,
        bedrooms: 3,
        bathrooms: 2,
        sizeM2: 120,
        photos: [],
        status: 'OCCUPIED',
        description: 'Charming 3-bedroom house with garden',
      },
    }),
    prisma.unit.create({
      data: {
        propertyId: property3.id,
        name: 'House 2',
        floor: 1,
        rent: 3200,
        bedrooms: 4,
        bathrooms: 3,
        sizeM2: 140,
        photos: [],
        status: 'AVAILABLE',
        description: 'Spacious 4-bedroom house with private yard',
      },
    }),
    prisma.unit.create({
      data: {
        propertyId: property3.id,
        name: 'House 3',
        floor: 1,
        rent: 3000,
        bedrooms: 3,
        bathrooms: 2,
        sizeM2: 130,
        photos: [],
        status: 'AVAILABLE',
        description: 'Modern 3-bedroom house with deck',
      },
    }),
  ]);

  const allUnits = [...sunsetUnits, ...downtownUnits, ...gardenUnits];
  console.log('✅ Created units:', allUnits.length);

  // Create a lease contract with billing configuration
  const lease = await prisma.leaseContract.create({
    data: {
      propertyId: property.id,
      unitId: sunsetUnits[2].id, // Unit 201 (occupied unit)
      landlordId: landlordProfile.id,
      tenantId: tenantProfile.id,
      startDate: new Date('2024-01-01'),
      endDate: new Date('2024-12-31'),
      rentAmount: 3000,
      depositAmount: 6000,
      status: 'ACTIVE',
      billingDay: 1,
      billingCycleMonths: 1, // Monthly billing
      discountType: 'PERCENT',
      discountValue: 5, // 5% discount
      signedAt: new Date('2023-12-15'),
    },
  });

  console.log('✅ Created lease contract:', lease.id);

  // Create lease fees
  const electricityFee = await prisma.leaseFee.create({
    data: {
      leaseId: lease.id,
      name: 'Electricity',
      type: 'VARIABLE',
      unitPrice: 0.15, // $0.15 per kWh
      billingUnit: 'kWh',
      isMandatory: true,
      isActive: true,
    },
  });

  const waterFee = await prisma.leaseFee.create({
    data: {
      leaseId: lease.id,
      name: 'Water',
      type: 'VARIABLE',
      unitPrice: 2.5, // $2.50 per m³
      billingUnit: 'm³',
      isMandatory: true,
      isActive: true,
    },
  });

  const parkingFee = await prisma.leaseFee.create({
    data: {
      leaseId: lease.id,
      name: 'Parking',
      type: 'FIXED',
      amount: 150, // $150 per month
      isMandatory: false,
      isActive: true,
    },
  });

  const serviceFee = await prisma.leaseFee.create({
    data: {
      leaseId: lease.id,
      name: 'Service Fee',
      type: 'FIXED',
      amount: 100, // $100 per month
      isMandatory: true,
      isActive: true,
    },
  });

  console.log('✅ Created lease fees:', 4);

  // Create usage records for the past 3 months
  const usageRecords = [];

  // January 2024 - Electricity
  usageRecords.push(
    await prisma.usageRecord.create({
      data: {
        leaseId: lease.id,
        feeId: electricityFee.id,
        periodMonth: new Date('2024-01-01'),
        usageValue: 150, // 150 kWh
        totalAmount: 150 * 0.15, // $22.50
      },
    })
  );

  // January 2024 - Water
  usageRecords.push(
    await prisma.usageRecord.create({
      data: {
        leaseId: lease.id,
        feeId: waterFee.id,
        periodMonth: new Date('2024-01-01'),
        usageValue: 15, // 15 m³
        totalAmount: 15 * 2.5, // $37.50
      },
    })
  );

  // February 2024 - Electricity
  usageRecords.push(
    await prisma.usageRecord.create({
      data: {
        leaseId: lease.id,
        feeId: electricityFee.id,
        periodMonth: new Date('2024-02-01'),
        usageValue: 180, // 180 kWh
        totalAmount: 180 * 0.15, // $27.00
      },
    })
  );

  // February 2024 - Water
  usageRecords.push(
    await prisma.usageRecord.create({
      data: {
        leaseId: lease.id,
        feeId: waterFee.id,
        periodMonth: new Date('2024-02-01'),
        usageValue: 18, // 18 m³
        totalAmount: 18 * 2.5, // $45.00
      },
    })
  );

  console.log('✅ Created usage records:', usageRecords.length);

  // Create an invoice for January 2024
  const invoice1 = await prisma.invoice.create({
    data: {
      leaseId: lease.id,
      invoiceNumber: `INV-${Date.now()}-001`,
      periodStart: new Date('2024-01-01'),
      periodEnd: new Date('2024-01-31'),
      issueDate: new Date('2024-01-01'),
      dueDate: new Date('2024-01-07'),
      subtotal: 3310, // 3000 + 22.5 + 37.5 + 150 + 100
      discountAmount: 165.5, // 5% of 3310
      taxAmount: 0,
      totalAmount: 3144.5, // 3310 - 165.5
      status: 'PAID',
      paidAt: new Date('2024-01-05'),
      paidAmount: 3144.5,
      paymentMethod: 'bank_transfer',
      items: {
        create: [
          {
            type: 'RENT',
            name: 'Rent',
            description: 'Monthly rent for January 2024',
            quantity: 1,
            unitPrice: 3000,
            amount: 3000,
            periodStart: new Date('2024-01-01'),
            periodEnd: new Date('2024-01-31'),
          },
          {
            feeId: electricityFee.id,
            type: 'VARIABLE_FEE',
            name: 'Electricity',
            description: 'Electricity - 150 kWh',
            quantity: 150,
            unitPrice: 0.15,
            amount: 22.5,
            periodStart: new Date('2024-01-01'),
            periodEnd: new Date('2024-01-31'),
          },
          {
            feeId: waterFee.id,
            type: 'VARIABLE_FEE',
            name: 'Water',
            description: 'Water - 15 m³',
            quantity: 15,
            unitPrice: 2.5,
            amount: 37.5,
            periodStart: new Date('2024-01-01'),
            periodEnd: new Date('2024-01-31'),
          },
          {
            feeId: parkingFee.id,
            type: 'FIXED_FEE',
            name: 'Parking',
            description: 'Monthly parking fee',
            quantity: 1,
            unitPrice: 150,
            amount: 150,
            periodStart: new Date('2024-01-01'),
            periodEnd: new Date('2024-01-31'),
          },
          {
            feeId: serviceFee.id,
            type: 'FIXED_FEE',
            name: 'Service Fee',
            description: 'Monthly service fee',
            quantity: 1,
            unitPrice: 100,
            amount: 100,
            periodStart: new Date('2024-01-01'),
            periodEnd: new Date('2024-01-31'),
          },
          {
            type: 'DISCOUNT',
            name: 'Discount (5%)',
            description: 'Monthly discount applied',
            quantity: 1,
            unitPrice: -165.5,
            amount: -165.5,
            periodStart: new Date('2024-01-01'),
            periodEnd: new Date('2024-01-31'),
          },
        ],
      },
    },
    include: {
      items: true,
    },
  });

  console.log('✅ Created invoice (PAID):', invoice1.invoiceNumber);

  // Create a second lease with quarterly billing
  const quarterlyLease = await prisma.leaseContract.create({
    data: {
      propertyId: property2.id,
      unitId: downtownUnits[0].id, // Unit A101 (occupied unit)
      landlordId: landlordProfile.id,
      tenantId: tenantProfile.id,
      startDate: new Date('2024-01-01'),
      endDate: new Date('2024-12-31'),
      rentAmount: 3500,
      depositAmount: 7000,
      status: 'ACTIVE',
      billingDay: 1,
      billingCycleMonths: 3, // Quarterly billing
      discountType: 'FIXED',
      discountValue: 500, // $500 discount per quarter
      signedAt: new Date('2023-12-15'),
    },
  });

  // Add a fixed fee to quarterly lease
  const quarterlyServiceFee = await prisma.leaseFee.create({
    data: {
      leaseId: quarterlyLease.id,
      name: 'Management Fee',
      type: 'FIXED',
      amount: 75, // $75 per month
      isMandatory: true,
      isActive: true,
    },
  });

  console.log('✅ Created quarterly lease with billing:', quarterlyLease.id);

  console.log('🎉 Database seeding completed!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

