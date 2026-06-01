import { NextRequest } from "next/server";
import { getPrisma } from "@/lib/db";

export async function GET() {
  const prisma = await getPrisma();
  const members = await prisma.teamMember.findMany({ orderBy: { createdAt: "asc" } });
  return Response.json(members);
}

export async function POST(request: NextRequest) {
  const { name } = await request.json();
  if (!name?.trim()) return Response.json({ error: "Nome obrigatório." }, { status: 400 });
  const prisma = await getPrisma();
  const member = await prisma.teamMember.create({ data: { name: name.trim() } });
  return Response.json(member, { status: 201 });
}
