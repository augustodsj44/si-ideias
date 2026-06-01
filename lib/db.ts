import { PrismaClient } from "@/app/generated/prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";

let _prisma: PrismaClient | null = null;

export async function getPrisma(): Promise<PrismaClient> {
  if (_prisma) return _prisma;

  const url = process.env["DATABASE_URL"];
  const authToken = process.env["TURSO_AUTH_TOKEN"];

  if (!url) throw new Error("DATABASE_URL não configurada.");

  const adapter = new PrismaLibSql({ url, authToken });
  _prisma = new PrismaClient({ adapter } as never);
  return _prisma;
}
