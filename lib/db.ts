import { PrismaClient } from "@/app/generated/prisma/client";
import path from "path";

function createPrisma(): PrismaClient {
  const dbUrl = process.env.DATABASE_URL ?? "file:./dev.db";

  if (dbUrl.startsWith("libsql://") || dbUrl.startsWith("https://")) {
    // Produção: Turso (libsql)
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { createClient } = require("@libsql/client");
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { PrismaLibSQL } = require("@prisma/adapter-libsql");
    const libsql = createClient({ url: dbUrl, authToken: process.env.TURSO_AUTH_TOKEN });
    const adapter = new PrismaLibSQL(libsql);
    return new PrismaClient({ adapter } as never);
  }

  // Desenvolvimento local: SQLite via better-sqlite3
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { PrismaBetterSqlite3 } = require("@prisma/adapter-better-sqlite3");
  const dbFile = dbUrl.replace(/^file:/, "");
  const dbPath = path.isAbsolute(dbFile) ? dbFile : path.resolve(process.cwd(), dbFile);
  const adapter = new PrismaBetterSqlite3({ url: dbPath });
  return new PrismaClient({ adapter } as never);
}

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma = globalForPrisma.prisma ?? createPrisma();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
