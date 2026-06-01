import { PrismaClient } from "@/app/generated/prisma/client";

let _prisma: PrismaClient | null = null;

export async function getPrisma(): Promise<PrismaClient> {
  if (_prisma) return _prisma;

  const dbUrl = process.env.DATABASE_URL ?? "file:./dev.db";

  if (dbUrl.startsWith("libsql://") || dbUrl.startsWith("https://")) {
    const { createClient } = await import("@libsql/client");
    const { PrismaLibSQL } = await import("@prisma/adapter-libsql");
    const libsql = createClient({ url: dbUrl, authToken: process.env.TURSO_AUTH_TOKEN });
    const adapter = new PrismaLibSQL(libsql);
    _prisma = new PrismaClient({ adapter } as never);
    return _prisma;
  }

  // Local dev only — sem import de "path"
  const { PrismaBetterSqlite3 } = await import("@prisma/adapter-better-sqlite3");
  const dbFile = dbUrl.replace(/^file:/, "");
  const adapter = new PrismaBetterSqlite3({ url: dbFile });
  _prisma = new PrismaClient({ adapter } as never);
  return _prisma;
}
