import { NextRequest } from "next/server";
import { getPrisma } from "@/lib/db";

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ commentId: string }> }
) {
  const { commentId } = await params;
  const prisma = await getPrisma();
  await prisma.comment.delete({ where: { id: commentId } });
  return new Response(null, { status: 204 });
}
