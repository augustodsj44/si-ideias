import { PrismaClient } from "@/app/generated/prisma/client";

function createPrisma(): PrismaClient {
  const dbUrl = process.env.DATABASE_URL ?? "file:./dev.db";

  if (dbUrl.startsWith("libsql://") || dbUrl.startsWith("https://")) {
    // Produção: Turso (libsql)
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { createClient } = require(/* turbopackIgnore: true */ "@libsql/client");
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { PrismaLibSQL } = require(/* turbopackIgnore: true */ "@prisma/adapter-libsql");
    const libsql = createClient({ url: dbUrl, authToken: process.env.TURSO_AUTH_TOKEN });
    const adapter = new PrismaLibSQL(libsql);
    return new PrismaClient({ adapter } as never);
  }

  // Desenvolvimento local: SQLite via better-sqlite3
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { PrismaBetterSqlite3 } = require(/* turbopackIgnore: true */ "@prisma/adapter-better-sqlite3");
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const nodePath = require(/* turbopackIgnore: true */ "path");
  const dbFile = dbUrl.replace(/^file:/, "");
  const dbPath = nodePath.isAbsolute(dbFile)
    ? dbFile
    : nodePath.resolve(/* turbopackIgnore: true */ process.cwd(), dbFile);
  const adapter = new PrismaBetterSqlite3({ url: dbPath });
  return new PrismaClient({ adapter } as never);
}

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma = globalForPrisma.prisma ?? createPrisma();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
