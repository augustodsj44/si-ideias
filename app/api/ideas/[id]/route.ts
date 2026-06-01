import { NextRequest } from "next/server";
import { getPrisma } from "@/lib/db";
import { TYPE_LABELS, type IdeaType } from "@/lib/types";

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const prisma = await getPrisma();
  await prisma.idea.delete({ where: { id } });
  return new Response(null, { status: 204 });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();
  const { type } = body;

  if (!type || !(type in TYPE_LABELS)) {
    return Response.json({ error: "Tipo inválido." }, { status: 400 });
  }

  const prisma = await getPrisma();
  const idea = await prisma.idea.update({
    where: { id },
    data: {
      type,
      typeLabel: TYPE_LABELS[type as IdeaType],
    },
  });

  return Response.json(idea);
}
