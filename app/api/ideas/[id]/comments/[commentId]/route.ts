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

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ commentId: string }> }
) {
  const { commentId } = await params;
  const { text } = await request.json();
  if (!text?.trim()) return Response.json({ error: "Comentário vazio." }, { status: 400 });
  const prisma = await getPrisma();
  const comment = await prisma.comment.update({
    where: { id: commentId },
    data: { text: text.trim() },
  });
  return Response.json(comment);
}
