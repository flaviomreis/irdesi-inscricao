import { prisma } from "@/db/connection";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const id = request.nextUrl.searchParams.get("id");
  if (!id) throw new Error("O id da turma não pode ser nulo");

  const courseClass = await prisma.courseClass.findUnique({
    where: {
      id,
    },
    include: {
      course: true,
      institution: true,
    },
  });
  return NextResponse.json(courseClass);
}
