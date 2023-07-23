import { prisma } from "@/db/connection";
import isAdministrator from "@/utils/is-administrator";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "../../auth/[...nextauth]/route";

async function getCourseClass(id: string) {
  const result = await prisma.courseClass.findUnique({
    where: {
      id,
    },
    include: {
      enrollment: {
        include: {
          student: true,
        },
      },
      institution: true,
      course: true,
    },
  });
  return result;
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);

  if (
    !session ||
    !session.user ||
    !(await isAdministrator(session.user.email))
  ) {
    return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
  }

  const id = params.id;

  const courseClass = await getCourseClass(id);
  if (!courseClass) {
    return NextResponse.json({});
  }
  const enrollment = courseClass?.enrollment;
  if (!enrollment) {
    return NextResponse.json({});
  }

  let output: string[] = [];
  output.push("username;firstname;lastname;email;course1;role1");

  enrollment.forEach((item) => {
    output.push(
      `${item.student.cpf};${item.student.name};${item.student.last_name};${item.student.email};${courseClass.course.short_name};student`
    );
  });

  const headers = new Headers();
  headers.set("Content-type", "txt/csv");
  headers.set(
    "Content-Disposition",
    `attachment; filename=${courseClass.institution.short_name}-${courseClass.course.short_name}.csv`
  );

  return new NextResponse(output.join("\n"), { status: 200, headers });
}
