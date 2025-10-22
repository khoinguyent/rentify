
Object.defineProperty(exports, "__esModule", { value: true });

const {
  Decimal,
  objectEnumValues,
  makeStrictEnum,
  Public,
  getRuntime,
  skip
} = require('./runtime/index-browser.js')


const Prisma = {}

exports.Prisma = Prisma
exports.$Enums = {}

/**
 * Prisma Client JS version: 5.22.0
 * Query Engine version: 605197351a3c8bdd595af2d2a9bc3025bca48ea2
 */
Prisma.prismaVersion = {
  client: "5.22.0",
  engine: "605197351a3c8bdd595af2d2a9bc3025bca48ea2"
}

Prisma.PrismaClientKnownRequestError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientKnownRequestError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)};
Prisma.PrismaClientUnknownRequestError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientUnknownRequestError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientRustPanicError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientRustPanicError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientInitializationError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientInitializationError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientValidationError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientValidationError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.NotFoundError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`NotFoundError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.Decimal = Decimal

/**
 * Re-export of sql-template-tag
 */
Prisma.sql = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`sqltag is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.empty = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`empty is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.join = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`join is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.raw = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`raw is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.validator = Public.validator

/**
* Extensions
*/
Prisma.getExtensionContext = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`Extensions.getExtensionContext is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.defineExtension = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`Extensions.defineExtension is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}

/**
 * Shorthand utilities for JSON filtering
 */
Prisma.DbNull = objectEnumValues.instances.DbNull
Prisma.JsonNull = objectEnumValues.instances.JsonNull
Prisma.AnyNull = objectEnumValues.instances.AnyNull

Prisma.NullTypes = {
  DbNull: objectEnumValues.classes.DbNull,
  JsonNull: objectEnumValues.classes.JsonNull,
  AnyNull: objectEnumValues.classes.AnyNull
}



/**
 * Enums
 */

exports.Prisma.TransactionIsolationLevel = makeStrictEnum({
  ReadUncommitted: 'ReadUncommitted',
  ReadCommitted: 'ReadCommitted',
  RepeatableRead: 'RepeatableRead',
  Serializable: 'Serializable'
});

exports.Prisma.UserScalarFieldEnum = {
  id: 'id',
  email: 'email',
  passwordHash: 'passwordHash',
  firstName: 'firstName',
  lastName: 'lastName',
  role: 'role',
  isActive: 'isActive',
  emailVerified: 'emailVerified',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.AccountScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  type: 'type',
  provider: 'provider',
  providerAccountId: 'providerAccountId',
  refresh_token: 'refresh_token',
  access_token: 'access_token',
  expires_at: 'expires_at',
  token_type: 'token_type',
  scope: 'scope',
  id_token: 'id_token',
  session_state: 'session_state'
};

exports.Prisma.SessionScalarFieldEnum = {
  id: 'id',
  sessionToken: 'sessionToken',
  userId: 'userId',
  expires: 'expires'
};

exports.Prisma.LandlordProfileScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  name: 'name',
  phone: 'phone',
  address: 'address',
  taxId: 'taxId',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.TenantProfileScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  fullName: 'fullName',
  email: 'email',
  phone: 'phone',
  dateOfBirth: 'dateOfBirth',
  emergencyContact: 'emergencyContact',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.PropertyScalarFieldEnum = {
  id: 'id',
  landlordId: 'landlordId',
  name: 'name',
  type: 'type',
  address: 'address',
  city: 'city',
  state: 'state',
  zipCode: 'zipCode',
  country: 'country',
  description: 'description',
  imageUrl: 'imageUrl',
  yearBuilt: 'yearBuilt',
  totalUnits: 'totalUnits',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.UnitScalarFieldEnum = {
  id: 'id',
  propertyId: 'propertyId',
  name: 'name',
  floor: 'floor',
  rentAmount: 'rentAmount',
  sizeM2: 'sizeM2',
  bedrooms: 'bedrooms',
  bathrooms: 'bathrooms',
  status: 'status',
  description: 'description',
  imageUrl: 'imageUrl',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.AmenityScalarFieldEnum = {
  id: 'id',
  name: 'name',
  description: 'description',
  icon: 'icon',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.PropertyAmenityScalarFieldEnum = {
  propertyId: 'propertyId',
  amenityId: 'amenityId'
};

exports.Prisma.LeaseContractScalarFieldEnum = {
  id: 'id',
  propertyId: 'propertyId',
  unitId: 'unitId',
  landlordId: 'landlordId',
  tenantId: 'tenantId',
  startDate: 'startDate',
  endDate: 'endDate',
  rentAmount: 'rentAmount',
  depositAmount: 'depositAmount',
  status: 'status',
  billingDay: 'billingDay',
  billingCycleMonths: 'billingCycleMonths',
  discountType: 'discountType',
  discountValue: 'discountValue',
  lateFeeAmount: 'lateFeeAmount',
  terms: 'terms',
  notes: 'notes',
  documentUrl: 'documentUrl',
  signedAt: 'signedAt',
  terminatedAt: 'terminatedAt',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.PaymentScalarFieldEnum = {
  id: 'id',
  leaseId: 'leaseId',
  amount: 'amount',
  dueDate: 'dueDate',
  paidDate: 'paidDate',
  status: 'status',
  paymentMethod: 'paymentMethod',
  transactionId: 'transactionId',
  notes: 'notes',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.MaintenanceRequestScalarFieldEnum = {
  id: 'id',
  leaseId: 'leaseId',
  title: 'title',
  description: 'description',
  priority: 'priority',
  status: 'status',
  imageUrl: 'imageUrl',
  resolvedAt: 'resolvedAt',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.LeaseFeeScalarFieldEnum = {
  id: 'id',
  leaseId: 'leaseId',
  name: 'name',
  type: 'type',
  amount: 'amount',
  unitPrice: 'unitPrice',
  billingUnit: 'billingUnit',
  isMandatory: 'isMandatory',
  isActive: 'isActive',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.UsageRecordScalarFieldEnum = {
  id: 'id',
  leaseId: 'leaseId',
  feeId: 'feeId',
  periodMonth: 'periodMonth',
  usageValue: 'usageValue',
  totalAmount: 'totalAmount',
  notes: 'notes',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.InvoiceScalarFieldEnum = {
  id: 'id',
  leaseId: 'leaseId',
  invoiceNumber: 'invoiceNumber',
  periodStart: 'periodStart',
  periodEnd: 'periodEnd',
  issueDate: 'issueDate',
  dueDate: 'dueDate',
  subtotal: 'subtotal',
  discountAmount: 'discountAmount',
  taxAmount: 'taxAmount',
  totalAmount: 'totalAmount',
  status: 'status',
  paidAt: 'paidAt',
  paidAmount: 'paidAmount',
  paymentMethod: 'paymentMethod',
  notes: 'notes',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.InvoiceItemScalarFieldEnum = {
  id: 'id',
  invoiceId: 'invoiceId',
  feeId: 'feeId',
  type: 'type',
  name: 'name',
  description: 'description',
  quantity: 'quantity',
  unitPrice: 'unitPrice',
  amount: 'amount',
  periodStart: 'periodStart',
  periodEnd: 'periodEnd',
  createdAt: 'createdAt'
};

exports.Prisma.SortOrder = {
  asc: 'asc',
  desc: 'desc'
};

exports.Prisma.QueryMode = {
  default: 'default',
  insensitive: 'insensitive'
};

exports.Prisma.NullsOrder = {
  first: 'first',
  last: 'last'
};
exports.UserRole = exports.$Enums.UserRole = {
  ADMIN: 'ADMIN',
  LANDLORD: 'LANDLORD',
  TENANT: 'TENANT',
  AGENT: 'AGENT'
};

exports.PropertyType = exports.$Enums.PropertyType = {
  APARTMENT: 'APARTMENT',
  HOUSE: 'HOUSE',
  CONDO: 'CONDO',
  COMMERCIAL: 'COMMERCIAL',
  OFFICE: 'OFFICE',
  WAREHOUSE: 'WAREHOUSE',
  LAND: 'LAND'
};

exports.UnitStatus = exports.$Enums.UnitStatus = {
  AVAILABLE: 'AVAILABLE',
  OCCUPIED: 'OCCUPIED',
  MAINTENANCE: 'MAINTENANCE',
  RESERVED: 'RESERVED'
};

exports.LeaseStatus = exports.$Enums.LeaseStatus = {
  DRAFT: 'DRAFT',
  ACTIVE: 'ACTIVE',
  EXPIRED: 'EXPIRED',
  TERMINATED: 'TERMINATED',
  RENEWED: 'RENEWED'
};

exports.DiscountType = exports.$Enums.DiscountType = {
  PERCENT: 'PERCENT',
  FIXED: 'FIXED'
};

exports.PaymentStatus = exports.$Enums.PaymentStatus = {
  PENDING: 'PENDING',
  PAID: 'PAID',
  OVERDUE: 'OVERDUE',
  CANCELLED: 'CANCELLED'
};

exports.FeeType = exports.$Enums.FeeType = {
  FIXED: 'FIXED',
  VARIABLE: 'VARIABLE'
};

exports.InvoiceStatus = exports.$Enums.InvoiceStatus = {
  UNPAID: 'UNPAID',
  PAID: 'PAID',
  OVERDUE: 'OVERDUE',
  CANCELLED: 'CANCELLED'
};

exports.InvoiceItemType = exports.$Enums.InvoiceItemType = {
  RENT: 'RENT',
  FIXED_FEE: 'FIXED_FEE',
  VARIABLE_FEE: 'VARIABLE_FEE',
  DISCOUNT: 'DISCOUNT'
};

exports.Prisma.ModelName = {
  User: 'User',
  Account: 'Account',
  Session: 'Session',
  LandlordProfile: 'LandlordProfile',
  TenantProfile: 'TenantProfile',
  Property: 'Property',
  Unit: 'Unit',
  Amenity: 'Amenity',
  PropertyAmenity: 'PropertyAmenity',
  LeaseContract: 'LeaseContract',
  Payment: 'Payment',
  MaintenanceRequest: 'MaintenanceRequest',
  LeaseFee: 'LeaseFee',
  UsageRecord: 'UsageRecord',
  Invoice: 'Invoice',
  InvoiceItem: 'InvoiceItem'
};

/**
 * This is a stub Prisma Client that will error at runtime if called.
 */
class PrismaClient {
  constructor() {
    return new Proxy(this, {
      get(target, prop) {
        let message
        const runtime = getRuntime()
        if (runtime.isEdge) {
          message = `PrismaClient is not configured to run in ${runtime.prettyName}. In order to run Prisma Client on edge runtime, either:
- Use Prisma Accelerate: https://pris.ly/d/accelerate
- Use Driver Adapters: https://pris.ly/d/driver-adapters
`;
        } else {
          message = 'PrismaClient is unable to run in this browser environment, or has been bundled for the browser (running in `' + runtime.prettyName + '`).'
        }
        
        message += `
If this is unexpected, please open an issue: https://pris.ly/prisma-prisma-bug-report`

        throw new Error(message)
      }
    })
  }
}

exports.PrismaClient = PrismaClient

Object.assign(exports, Prisma)
