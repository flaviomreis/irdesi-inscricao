import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "../../auth/[...nextauth]/route";
import isAdministrator from "@/utils/is-administrator";
import { prisma } from "@/db/connection";
import sendMoodleRequest from "@/utils/moodle-request";

async function getCourseClass(id: string) {
  return await prisma.courseClass.findUnique({
    where: {
      id,
    },
    include: {
      course_class_administrators: true,
      course: true,
    },
  });
}

export async function GET(
  request: NextRequest,
  { params }: { params: { cpf: string } }
) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    return NextResponse.json({ error: "Acesso negado" }, { status: 401 });
  }

  const course_id = request.nextUrl.searchParams.get("course_id") as string;
  const courseClass = await getCourseClass(course_id);

  if (!courseClass) {
    return NextResponse.json({ error: "Turma inválida" }, { status: 400 });
  }

  const cpf = params.cpf;

  if (!cpf) {
    return NextResponse.json({ error: "CPF é necessário" }, { status: 400 });
  }

  const isAdmin = await isAdministrator(session.user.email);
  const isCourseAdministrator = courseClass.course_class_administrators.find(
    (item) => item.email === session.user?.email
  );

  if (!isAdmin && !isCourseAdministrator) {
    return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
  }

  // Consulta se estudante já existe com o CPF como username
  const findUserParams = {
    wstoken: process.env.MOODLE_GET_TOKEN!,
    wsfunction: "core_user_get_users_by_field",
    moodlewsrestformat: "json",
    field: "username",
    "values[0]": cpf,
  };

  const { result: findUserResult, json: findUserJson } =
    await sendMoodleRequest(findUserParams);

  if (!findUserResult.ok) {
    return NextResponse.json(
      { error: "Erro ao tentar buscar o aluno no Moodle" },
      { status: 404 }
    );
  }

  if (!Array.isArray(findUserJson) || findUserJson.length != 1) {
    return NextResponse.json(
      {
        error:
          "Erro na resposta do Moodle, era esperada uma coleção com apenas um aluno",
      },
      { status: 404 }
    );
  }

  const userId = findUserJson[0].id;

  const findCoursesParams = {
    wstoken: process.env.MOODLE_GET_TOKEN!,
    wsfunction: "core_enrol_get_users_courses",
    moodlewsrestformat: "json",
    userid: userId,
  };

  const { result: findCoursesResult, json: findCoursesJson } =
    await sendMoodleRequest(findCoursesParams);

  if (!findCoursesResult.ok) {
    return NextResponse.json(
      { error: "Erro ao tentar buscar inscrições do aluno no Moodle" },
      { status: 404 }
    );
  }

  if (!Array.isArray(findCoursesJson)) {
    return NextResponse.json(
      {
        error: "Erro na resposta do Moodle, era esperada uma coleção de cursos",
      },
      { status: 404 }
    );
  }

  if (findCoursesJson.length < 1) {
    return NextResponse.json(
      {
        error: "Aluno não matriculado no curso",
      },
      { status: 404 }
    );
  }

  const index = findCoursesJson.findIndex(
    (course) => course.id == courseClass.course.moodle_id
  );

  if (index < 0) {
    return NextResponse.json(
      {
        error: "Aluno não matriculado no curso",
      },
      { status: 404 }
    );
  }

  const courseLastAccess = findCoursesJson[index].lastaccess;
  const courseProgress = findCoursesJson[index].progress;

  return NextResponse.json(
    {
      courseLastAccess,
      courseProgress,
    },
    { status: 200 }
  );
}
