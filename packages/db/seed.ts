import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Seed document types
  console.log('📄 Seeding document types...');
  const documentTypes = [
    { name: 'Contract', code: 'LEASE_CONTRACT', objectTypes: ['Lease'], isShared: false },
    { name: 'Appendix', code: 'LEASE_APPENDIX', objectTypes: ['Lease'], isShared: false },
    { name: 'Passport', code: 'TENANT_PASSPORT', objectTypes: ['Tenant'], isShared: false },
    { name: 'Visa', code: 'TENANT_VISA', objectTypes: ['Tenant'], isShared: false },
    { name: 'Driver License', code: 'TENANT_DRIVER_LICENSE', objectTypes: ['Tenant'], isShared: false },
    { name: 'Proof of Address', code: 'DOC_PROOF_ADDRESS', objectTypes: ['Lease', 'Tenant'], isShared: true },
    { name: 'Other', code: 'DOC_OTHER', objectTypes: [], isShared: true },
  ];

  for (const type of documentTypes) {
    await prisma.documentType.upsert({
      where: { code: type.code },
      update: {},
      create: type,
    });
  }
  console.log('✅ Seeded document types');

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

  // Clean up existing properties and related data
  console.log('🧹 Cleaning up existing properties and related data...');
  // Delete in order to respect foreign key constraints
  await prisma.leaseContract.deleteMany({});
  await prisma.property.deleteMany({});
  console.log('✅ Cleaned up existing properties');

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

  // Create comprehensive amenities list (Airbnb-style)
  const amenities = await Promise.all([
    // Basic Amenities
    prisma.amenity.upsert({
      where: { name: 'WiFi' },
      update: {},
      create: { name: 'WiFi', description: 'High-speed internet included', icon: '📶' },
    }),
    prisma.amenity.upsert({
      where: { name: 'Air Conditioning' },
      update: {},
      create: { name: 'Air Conditioning', description: 'Central air conditioning', icon: '❄️' },
    }),
    prisma.amenity.upsert({
      where: { name: 'Heating' },
      update: {},
      create: { name: 'Heating', description: 'Central heating system', icon: '🔥' },
    }),
    prisma.amenity.upsert({
      where: { name: 'Kitchen' },
      update: {},
      create: { name: 'Kitchen', description: 'Fully equipped kitchen', icon: '🍳' },
    }),
    prisma.amenity.upsert({
      where: { name: 'Refrigerator' },
      update: {},
      create: { name: 'Refrigerator', description: 'Full-size refrigerator', icon: '🧊' },
    }),
    prisma.amenity.upsert({
      where: { name: 'Microwave' },
      update: {},
      create: { name: 'Microwave', description: 'Microwave oven', icon: '📡' },
    }),
    prisma.amenity.upsert({
      where: { name: 'Dishwasher' },
      update: {},
      create: { name: 'Dishwasher', description: 'Built-in dishwasher', icon: '🍽️' },
    }),
    prisma.amenity.upsert({
      where: { name: 'Coffee Maker' },
      update: {},
      create: { name: 'Coffee Maker', description: 'Coffee machine', icon: '☕' },
    }),
    
    // Bathroom & Laundry
    prisma.amenity.upsert({
      where: { name: 'Washing Machine' },
      update: {},
      create: { name: 'Washing Machine', description: 'In-unit washer', icon: '🧺' },
    }),
    prisma.amenity.upsert({
      where: { name: 'Dryer' },
      update: {},
      create: { name: 'Dryer', description: 'Clothes dryer', icon: '🌪️' },
    }),
    prisma.amenity.upsert({
      where: { name: 'Hot Water' },
      update: {},
      create: { name: 'Hot Water', description: 'Reliable hot water', icon: '♨️' },
    }),
    
    // Entertainment
    prisma.amenity.upsert({
      where: { name: 'TV' },
      update: {},
      create: { name: 'TV', description: 'Smart TV with streaming', icon: '📺' },
    }),
    prisma.amenity.upsert({
      where: { name: 'Sound System' },
      update: {},
      create: { name: 'Sound System', description: 'Audio system', icon: '🔊' },
    }),
    prisma.amenity.upsert({
      where: { name: 'Game Console' },
      update: {},
      create: { name: 'Game Console', description: 'Gaming console', icon: '🎮' },
    }),
    
    // Outdoor & Parking
    prisma.amenity.upsert({
      where: { name: 'Parking' },
      update: {},
      create: { name: 'Parking', description: 'On-site parking', icon: '🅿️' },
    }),
    prisma.amenity.upsert({
      where: { name: 'Balcony' },
      update: {},
      create: { name: 'Balcony', description: 'Private balcony', icon: '🏠' },
    }),
    prisma.amenity.upsert({
      where: { name: 'Garden' },
      update: {},
      create: { name: 'Garden', description: 'Private garden', icon: '🌱' },
    }),
    prisma.amenity.upsert({
      where: { name: 'Patio' },
      update: {},
      create: { name: 'Patio', description: 'Outdoor patio', icon: '🏡' },
    }),
    prisma.amenity.upsert({
      where: { name: 'BBQ Grill' },
      update: {},
      create: { name: 'BBQ Grill', description: 'Barbecue grill', icon: '🔥' },
    }),
    
    // Building Amenities
    prisma.amenity.upsert({
      where: { name: 'Swimming Pool' },
      update: {},
      create: { name: 'Swimming Pool', description: 'Shared swimming pool', icon: '🏊' },
    }),
    prisma.amenity.upsert({
      where: { name: 'Gym' },
      update: {},
      create: { name: 'Gym', description: 'Fitness center', icon: '💪' },
    }),
    prisma.amenity.upsert({
      where: { name: 'Sauna' },
      update: {},
      create: { name: 'Sauna', description: 'Sauna facility', icon: '🧖' },
    }),
    prisma.amenity.upsert({
      where: { name: 'Elevator' },
      update: {},
      create: { name: 'Elevator', description: 'Building elevator', icon: '🛗' },
    }),
    prisma.amenity.upsert({
      where: { name: 'Concierge' },
      update: {},
      create: { name: 'Concierge', description: '24/7 concierge service', icon: '🏛️' },
    }),
    
    // Safety & Security
    prisma.amenity.upsert({
      where: { name: 'Security System' },
      update: {},
      create: { name: 'Security System', description: 'Security cameras', icon: '🔒' },
    }),
    prisma.amenity.upsert({
      where: { name: 'Smoke Detector' },
      update: {},
      create: { name: 'Smoke Detector', description: 'Smoke detection system', icon: '🚨' },
    }),
    prisma.amenity.upsert({
      where: { name: 'Carbon Monoxide Detector' },
      update: {},
      create: { name: 'Carbon Monoxide Detector', description: 'CO detection', icon: '⚠️' },
    }),
    
    // Pet & Family
    prisma.amenity.upsert({
      where: { name: 'Pet Friendly' },
      update: {},
      create: { name: 'Pet Friendly', description: 'Pets allowed', icon: '🐕' },
    }),
    prisma.amenity.upsert({
      where: { name: 'Child Friendly' },
      update: {},
      create: { name: 'Child Friendly', description: 'Suitable for children', icon: '👶' },
    }),
    prisma.amenity.upsert({
      where: { name: 'High Chair' },
      update: {},
      create: { name: 'High Chair', description: 'Baby high chair', icon: '🪑' },
    }),
    
    // Accessibility
    prisma.amenity.upsert({
      where: { name: 'Wheelchair Accessible' },
      update: {},
      create: { name: 'Wheelchair Accessible', description: 'ADA compliant', icon: '♿' },
    }),
    prisma.amenity.upsert({
      where: { name: 'Step-Free Access' },
      update: {},
      create: { name: 'Step-Free Access', description: 'No stairs required', icon: '🚪' },
    }),
    
    // Work & Business
    prisma.amenity.upsert({
      where: { name: 'Dedicated Workspace' },
      update: {},
      create: { name: 'Dedicated Workspace', description: 'Home office space', icon: '💻' },
    }),
    prisma.amenity.upsert({
      where: { name: 'Printer' },
      update: {},
      create: { name: 'Printer', description: 'Printer available', icon: '🖨️' },
    }),
    
    // Luxury Amenities
    prisma.amenity.upsert({
      where: { name: 'Jacuzzi' },
      update: {},
      create: { name: 'Jacuzzi', description: 'Hot tub', icon: '🛁' },
    }),
    prisma.amenity.upsert({
      where: { name: 'Fireplace' },
      update: {},
      create: { name: 'Fireplace', description: 'Gas or electric fireplace', icon: '🔥' },
    }),
    prisma.amenity.upsert({
      where: { name: 'Wine Cellar' },
      update: {},
      create: { name: 'Wine Cellar', description: 'Wine storage', icon: '🍷' },
    }),
  ]);

  console.log('✅ Created amenities:', amenities.length);

  // Calculate dates
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();
  const lastMonthStart = new Date(currentYear, currentMonth - 1, 1);
  const yearStart = new Date(currentYear, 0, 1); // January 1st
  const yearEnd = new Date(currentYear, 11, 31); // December 31st

  // Create first property - with 3 units, all available from last month
  const property1 = await prisma.property.create({
    data: {
      landlordId: landlordProfile.id,
      name: 'Riverside Apartment Complex',
      type: 'APARTMENT',
      address: '125 Riverside Drive',
      city: 'New York',
      state: 'NY',
      zipCode: '10001',
      country: 'US',
      description: 'Modern apartment complex with stunning river views',
      totalUnits: 3,
      yearBuilt: 2020,
      status: 'AVAILABLE',
      hasMultipleUnits: true,
      photos: [],
      tags: ['modern', 'river-view', 'pet-friendly'],
    },
  });

  console.log('✅ Created property 1:', property1.name);

  // Create second property
  const property2 = await prisma.property.create({
    data: {
      landlordId: landlordProfile.id,
      name: 'Downtown Luxury Lofts',
      type: 'LOFT',
      address: '567 Broadway',
      city: 'New York',
      state: 'NY',
      zipCode: '10012',
      country: 'US',
      description: 'Stylish loft apartments in the heart of downtown',
      totalUnits: 1,
      yearBuilt: 2019,
      status: 'RENTED',
      hasMultipleUnits: false,
      photos: [],
      tags: ['loft', 'downtown', 'luxury'],
    },
  });

  console.log('✅ Created property 2:', property2.name);

  // Create third property
  const property3 = await prisma.property.create({
    data: {
      landlordId: landlordProfile.id,
      name: 'Urban Gardens Townhouse',
      type: 'TOWNHOUSE',
      address: '890 Park Avenue',
      city: 'New York',
      state: 'NY',
      zipCode: '10021',
      country: 'US',
      description: 'Beautiful townhouse with private garden space',
      totalUnits: 1,
      yearBuilt: 2021,
      status: 'AVAILABLE',
      hasMultipleUnits: false,
      photos: [],
      tags: ['townhouse', 'garden', 'spacious'],
    },
  });

  console.log('✅ Created property 3:', property3.name);

  // Link amenities to properties
  // Property 1 - Riverside Apartment Complex - comprehensive amenities
  const amenityIndices1 = [0, 1, 2, 3, 6, 7, 13, 14]; // WiFi, AC, Heating, Kitchen, Refrigerator, Microwave, TV, Parking
  await Promise.all(
    amenityIndices1.map((idx) =>
      prisma.propertyAmenity.create({
        data: {
          propertyId: property1.id,
          amenityId: amenities[idx].id,
        },
      })
    )
  );

  // Property 2 - Downtown Luxury Lofts - premium amenities
  const amenityIndices2 = [0, 1, 2, 3, 13, 14, 17, 20]; // WiFi, AC, Heating, Kitchen, TV, Parking, Elevator, Security System
  await Promise.all(
    amenityIndices2.map((idx) =>
      prisma.propertyAmenity.create({
        data: {
          propertyId: property2.id,
          amenityId: amenities[idx].id,
        },
      })
    )
  );

  // Property 3 - Urban Gardens Townhouse - luxury amenities
  const amenityIndices3 = [0, 1, 2, 3, 8, 11, 14, 22]; // WiFi, AC, Heating, Kitchen, Balcony, Garden, Patio, Pet Friendly
  await Promise.all(
    amenityIndices3.map((idx) =>
      prisma.propertyAmenity.create({
        data: {
          propertyId: property3.id,
          amenityId: amenities[idx].id,
        },
      })
    )
  );

  // Create units for Property 1 (Riverside Apartment Complex) - 3 units, all available from last month
  const riversideUnits = await Promise.all([
    prisma.unit.create({
      data: {
        propertyId: property1.id,
        name: 'Unit 301',
        floor: 3,
        rent: 2800,
        bedrooms: 2,
        bathrooms: 2,
        sizeM2: 95,
        photos: [],
        status: 'AVAILABLE',
        availableFrom: lastMonthStart,
        description: 'Spacious 2-bedroom apartment with stunning river views, modern kitchen',
      },
    }),
    prisma.unit.create({
      data: {
        propertyId: property1.id,
        name: 'Unit 302',
        floor: 3,
        rent: 3200,
        bedrooms: 3,
        bathrooms: 2,
        sizeM2: 110,
        photos: [],
        status: 'AVAILABLE',
        availableFrom: lastMonthStart,
        description: 'Luxurious 3-bedroom unit with large windows and river balcony',
      },
    }),
    prisma.unit.create({
      data: {
        propertyId: property1.id,
        name: 'Unit 303',
        floor: 3,
        rent: 2600,
        bedrooms: 2,
        bathrooms: 1,
        sizeM2: 85,
        photos: [],
        status: 'AVAILABLE',
        availableFrom: lastMonthStart,
        description: 'Modern 2-bedroom apartment, perfect for professionals',
      },
    }),
  ]);

  console.log('✅ Created units for Property 1 (Riverside):', riversideUnits.length);

  // Create unit for Property 2 (Downtown Luxury Lofts) - 1 unit, OCCUPIED
  const downtownUnits = await Promise.all([
    prisma.unit.create({
      data: {
        propertyId: property2.id,
        name: 'Loft Suite',
        floor: 5,
        rent: 4500,
        bedrooms: 2,
        bathrooms: 2,
        sizeM2: 120,
        photos: [],
        status: 'OCCUPIED',
        description: 'Luxury loft suite with high ceilings and downtown views',
      },
    }),
  ]);

  console.log('✅ Created unit for Property 2 (Downtown Lofts):', downtownUnits.length);

  // Create unit for Property 3 (Urban Gardens Townhouse) - 1 unit
  const townhouseUnits = await Promise.all([
    prisma.unit.create({
      data: {
        propertyId: property3.id,
        name: 'Main Residence',
        floor: 1,
        rent: 3800,
        bedrooms: 3,
        bathrooms: 2.5,
        sizeM2: 140,
        photos: [],
        status: 'AVAILABLE',
        description: 'Beautiful townhouse with private garden, perfect for families',
      },
    }),
  ]);

  console.log('✅ Created unit for Property 3 (Townhouse):', townhouseUnits.length);

  const allUnits = [...riversideUnits, ...downtownUnits, ...townhouseUnits];
  console.log('✅ Created total units:', allUnits.length);

  // Create a lease contract for the occupied unit (Property 2)
  const lease = await prisma.leaseContract.create({
    data: {
      propertyId: property2.id,
      unitId: downtownUnits[0].id, // Loft Suite (occupied unit)
      landlordId: landlordProfile.id,
      tenantId: tenantProfile.id,
      startDate: yearStart,
      endDate: yearEnd,
      rentAmount: 4500,
      depositAmount: 9000,
      status: 'ACTIVE',
      billingDay: 1,
      billingCycleMonths: 1, // Monthly billing
      discountType: 'PERCENT',
      discountValue: 5, // 5% discount
      signedAt: new Date(yearStart.getTime() - 7 * 24 * 60 * 60 * 1000), // Signed 7 days before lease start
      documentUrl: 'http://localhost:9000/rentify-files/leases/lease-sample.pdf', // Placeholder PDF URL
    },
  });

  console.log('✅ Created lease contract:', lease.id);

  // Create lease fees
  await Promise.all([
    prisma.leaseFee.create({
      data: {
        leaseId: lease.id,
        name: 'Electricity',
        type: 'VARIABLE',
        unitPrice: 0.15, // $0.15 per kWh
        billingUnit: 'kWh',
        isMandatory: true,
        isActive: true,
      },
    }),
    prisma.leaseFee.create({
      data: {
        leaseId: lease.id,
        name: 'Water',
        type: 'VARIABLE',
        unitPrice: 2.5, // $2.50 per m³
        billingUnit: 'm³',
        isMandatory: true,
        isActive: true,
      },
    }),
    prisma.leaseFee.create({
      data: {
        leaseId: lease.id,
        name: 'Parking',
        type: 'FIXED',
        amount: 200, // $200 per month
        isMandatory: false,
        isActive: true,
      },
    }),
    prisma.leaseFee.create({
      data: {
        leaseId: lease.id,
        name: 'Maintenance Fee',
        type: 'FIXED',
        amount: 150, // $150 per month
        isMandatory: true,
        isActive: true,
      },
    }),
  ]);

  console.log('✅ Created lease fees for the active lease');

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

