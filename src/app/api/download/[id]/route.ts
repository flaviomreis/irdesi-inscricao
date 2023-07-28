import { prisma } from "@/db/connection";
import isAdministrator from "@/utils/is-administrator";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "../../auth/[...nextauth]/route";
import archiver from "archiver";

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
  const checked = request.nextUrl.searchParams.get("checked");
  const groups: number = +(request.nextUrl.searchParams.get("groups") ?? 0);

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

  const archive = archiver("zip", { gzip: false, store: false });
  // archive.append(Buffer.from("file1"), { name: "file1.txt" });
  // archive.append(Buffer.from("file2"), { name: "file2.txt" });
  archive.append(Buffer.from(output.join("\n")), { name: "lista.csv" });
  await archive.finalize();
  const chuncks = [];
  for await (let chunck of archive) {
    chuncks.push(chunck);
  }

  const headers = new Headers();

  if (checked && checked === "false") {
    headers.set("Content-type", "txt/csv");
    headers.set(
      "Content-Disposition",
      `attachment; filename=${courseClass.institution.short_name}-${courseClass.course.short_name}.csv`
    );
    return new NextResponse(output.join("\n"), { status: 200, headers });
  } else {
    headers.set("Content-type", "application/zip");
    headers.set(
      "Content-Disposition",
      `attachment; filename=${courseClass.institution.short_name}-${courseClass.course.short_name}.zip`
    );
    return new NextResponse(Buffer.concat(chuncks), { status: 200, headers });
  }
}
