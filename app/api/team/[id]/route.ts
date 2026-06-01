import { NextRequest } from "next/server";
import { getPrisma } from "@/lib/db";

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const prisma = await getPrisma();
  await prisma.teamMember.delete({ where: { id } });
  return new Response(null, { status: 204 });
}
