import { prisma } from "@/db/connection";
import { NextResponse } from "next/server";

export async function GET() {
  const courseClasses = await prisma.courseClass.findMany();
  return NextResponse.json(courseClasses);
}
