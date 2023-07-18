import { prisma } from "@/db/connection";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  // const id = request.nextUrl.searchParams.get("id");
  // const courseClass = await prisma.courseClass.findUnique({
  //   where: {
  //     id,
  //   },
  //   include: {
  //     course: true,
  //     institution: true,
  //   },
  // });
  // return NextResponse.json(courseClass);
}
