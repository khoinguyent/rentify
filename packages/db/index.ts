const { PrismaClient, ...prismaExports } = require('./generated/client');

declare global {
  // eslint-disable-next-line no-var
  var prisma: typeof prismaInstance | undefined;
}

const prismaInstance =
  (global as any).prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  (global as any).prisma = prismaInstance;
}

// Export everything
const prisma = prismaInstance;
module.exports = {
  prisma,
  PrismaClient,
  ...prismaExports,
};

