import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const idea = await prisma.idea.update({
    where: { id },
    data: { votes: { increment: 1 } },
  });

  return Response.json(idea);
}
