import { PrismaClient } from './generated/client';
declare global {
    var prisma: PrismaClient | undefined;
}
export declare const prisma: PrismaClient<import("./generated/client").Prisma.PrismaClientOptions, never, import("./generated/client/runtime/library").DefaultArgs>;
export * from './generated/client';
