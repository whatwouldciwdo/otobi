import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const shouldSkipPrismaInit =
  process.env.NEXT_PHASE === "phase-production-build" ||
  (process.env.NODE_ENV === "production" && !process.env.DATABASE_URL) ||
  process.env.npm_lifecycle_event === "build";

const createPrismaPlaceholder = () =>
  new Proxy(
    {},
    {
      get: () =>
        new Proxy(
          {},
          {
            get: () => () => {},
          },
        ),
    },
  ) as PrismaClient;

const prismaClientSingleton = () => {
  if (shouldSkipPrismaInit) {
    console.warn("Skipping PrismaClient init during Next.js static build");
    return createPrismaPlaceholder();
  }

  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is required to initialize Prisma");
  }

  const pool = globalThis.prismaPoolGlobal ?? new Pool({ connectionString: process.env.DATABASE_URL });
  const adapter = new PrismaPg(pool);

  if (process.env.NODE_ENV !== "production") {
    globalThis.prismaPoolGlobal = pool;
  }

  return new PrismaClient({ adapter });
};

declare global {
  var prismaGlobal: PrismaClient | undefined;
  var prismaPoolGlobal: Pool | undefined;
}

const prisma = globalThis.prismaGlobal ?? prismaClientSingleton();

export default prisma;

if (process.env.NODE_ENV !== "production") {
  globalThis.prismaGlobal = prisma;
}
