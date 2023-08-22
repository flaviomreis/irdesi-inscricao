import { prisma } from "@/db/connection";
import isAdministrator from "@/utils/is-administrator";
import { Enrollment } from "@prisma/client";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "../../auth/[...nextauth]/route";

async function updateEnrollmentStatusIfNecessary(
  enrollment: Enrollment,
  enrollmentStatusType: string
) {
  if (enrollmentStatusType == "Sent") {
    await prisma.enrollment.update({
      where: {
        id: enrollment.id,
      },
      data: {
        enrollment_status: {
          create: [
            {
              enrollment_status_type: "Confirmed",
            },
          ],
        },
      },
    });
  }
}

async function getCourseClass(id: string) {
  const result = await prisma.courseClass.findUnique({
    where: {
      id,
    },
    include: {
      enrollment: {
        include: {
          student: true,
          enrollment_status: {
            take: 1,
            orderBy: {
              created_at: "desc",
            },
          },
        },
        orderBy: [
          {
            student: {
              name: "asc",
            },
          },
        ],
      },
      institution: true,
      course: true,
    },
  });
  return result;
}

type ResultType = {
  id: string;
  username: string;
  firstname: string;
  lastname: string;
  email: string;
};

async function getMoodleCourseEnrollments(id: string): Promise<ResultType[]> {
  const token = process.env.MOODLE_GET_TOKEN;
  const result = await fetch(
    `https://irdesieducacao.com.br/ava/webservice/rest/server.php?wstoken=${token}&moodlewsrestformat=json&wsfunction=core_enrol_get_enrolled_users&courseid=${id}`,
    {
      cache: "no-store",
    }
  );

  const json = (await result.json()) as ResultType[];
  // const json: ResultType[] = [
  //   {
  //     id: "1",
  //     username: "92721745034",
  //     firstname: "Flávio",
  //     lastname: "Reis",
  //     email: "flaviomreis@gmail.com",
  //   },
  //   {
  //     id: "2",
  //     username: "01698160011",
  //     firstname: "Catarini",
  //     lastname: "Reis",
  //     email: "catarinicreis@gmail.com",
  //   },
  // ];

  return json;
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
  const moodle_id = request.nextUrl.searchParams.get("moodle_id") as string;
  if (!moodle_id) {
    return NextResponse.json(
      { error: `O id do curso no Moodle não foi enviado.` },
      { status: 401 }
    );
  }

  const courseClass = await getCourseClass(id);

  if (!courseClass) {
    return NextResponse.json(
      { error: `A turma ${id} não existe.` },
      { status: 401 }
    );
  }

  const json = await getMoodleCourseEnrollments(moodle_id);

  if (!json) {
    return NextResponse.json(
      { error: `O acesso ao Moodle não retornou dados` },
      { status: 500 }
    );
  }

  const enrollments = courseClass.enrollment;

  for (let i = 0; i < json.length; i++) {
    const enrollment = enrollments.find(
      (item) => item.student.cpf == json[i].username
    );

    if (enrollment) {
      await updateEnrollmentStatusIfNecessary(
        enrollment,
        enrollment.enrollment_status[0].enrollment_status_type
      );
    }
  }

  return NextResponse.json(
    { error: "Sincronização concluída." },
    { status: 200 }
  );
}
