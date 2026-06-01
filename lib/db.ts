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
  } else {
    const { PrismaBetterSqlite3 } = await import("@prisma/adapter-better-sqlite3");
    const { resolve, isAbsolute } = await import("path");
    const dbFile = dbUrl.replace(/^file:/, "");
    const dbPath = isAbsolute(dbFile) ? dbFile : resolve(process.cwd(), dbFile);
    const adapter = new PrismaBetterSqlite3({ url: dbPath });
    _prisma = new PrismaClient({ adapter } as never);
  }

  return _prisma;
}
