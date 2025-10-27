import { DatabaseService } from '../database/database.service';

export async function seedDocumentTypes(databaseService: DatabaseService) {
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
    await databaseService.documentType.upsert({
      where: { code: type.code },
      update: {},
      create: type,
    });
  }

  console.log('✅ Seeded document types');
}

