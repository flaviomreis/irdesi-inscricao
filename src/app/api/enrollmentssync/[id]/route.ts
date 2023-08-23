import { prisma } from "@/db/connection";
import isAdministrator from "@/utils/is-administrator";
import { Enrollment } from "@prisma/client";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "../../auth/[...nextauth]/route";
import sendMoodleRequest from "@/utils/moodle-request";

async function updateEnrollmentStatusIfNecessary(
  enrollment: Enrollment,
  enrollmentStatusType: string
) {
  // if (enrollmentStatusType == null) {
  //   await prisma.enrollmentStatus.delete({
  //     where: {
  //       AND: [
  //         {
  //           enrollment_id: enrollment.id,
  //         },
  //         {
  //           enrollment_status_type: "Confirmed",
  //         },
  //       ],
  //     },
  //   });
  // }
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

async function getEnrollment(id: string) {
  const result = await prisma.enrollment.findUnique({
    where: {
      id,
    },
    include: {
      student: true,
      enrollment_status: {
        take: 1,
        orderBy: {
          created_at: "desc",
        },
      },
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

  const enrollments = courseClass.enrollment;
  for (let i = 0; i < enrollments.length; i++) {
    const enrollment = enrollments[i];
    // Consulta se estudante já existe com o CPF como username
    const findUserParams = {
      wstoken: process.env.MOODLE_GET_TOKEN!,
      wsfunction: "core_user_get_users_by_field",
      moodlewsrestformat: "json",
      field: "username",
      "values[0]": enrollment.student.cpf,
    };

    const findUserJson = await sendMoodleRequest(findUserParams);

    if (Array.isArray(findUserJson) && findUserJson.length == 1) {
      const userId = findUserJson[0].id;

      const findCoursesParams = {
        wstoken: process.env.MOODLE_GET_TOKEN!,
        wsfunction: "core_enrol_get_users_courses",
        moodlewsrestformat: "json",
        userid: userId,
      };

      const findCoursesJson = await sendMoodleRequest(findCoursesParams);

      if (Array.isArray(findCoursesJson) && findCoursesJson.length > 0) {
        const index = findCoursesJson.findIndex(
          (course) => course.id == moodle_id
        );

        if (index >= 0) {
          await updateEnrollmentStatusIfNecessary(
            enrollment,
            enrollment.enrollment_status[0].enrollment_status_type
          );
        }
      }
    }
  }

  return NextResponse.json(
    { error: "Sincronização concluída." },
    { status: 200 }
  );
}

export async function PUT(
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

  const enrollment = await getEnrollment(id);

  if (!enrollment) {
    return NextResponse.json(
      { error: `A inscrição ${id} não existe.` },
      { status: 401 }
    );
  }

  // Consulta se estudante já existe com o CPF como username
  const findUserParams = {
    wstoken: process.env.MOODLE_GET_TOKEN!,
    wsfunction: "core_user_get_users_by_field",
    moodlewsrestformat: "json",
    field: "username",
    "values[0]": enrollment.student.cpf,
  };

  const { result: findUserResult, json: findUserJson } =
    await sendMoodleRequest(findUserParams);

  if (!findUserResult.ok) {
    return NextResponse.json(
      { error: "Erro ao tentar buscar o aluno no Moodle" },
      { status: findUserResult.status }
    );
  }

  if (!Array.isArray(findUserJson)) {
    return NextResponse.json(
      {
        error: "Erro na resposta do Moodle, era esperada uma coleção de alunos",
      },
      { status: findUserResult.status }
    );
  }

  if (findUserJson.length != 1) {
    return NextResponse.json(
      {
        error:
          "Erro na resposta do Moodle, era esperada uma coleção com apenas um aluno",
      },
      { status: findUserResult.status }
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
      { status: findCoursesResult.status }
    );
  }

  if (!Array.isArray(findCoursesJson)) {
    return NextResponse.json(
      {
        error: "Erro na resposta do Moodle, era esperada uma coleção de cursos",
      },
      { status: findCoursesResult.status }
    );
  }

  if (findCoursesJson.length > 0) {
    const index = findCoursesJson.findIndex((course) => course.id == moodle_id);

    if (index >= 0) {
      await updateEnrollmentStatusIfNecessary(
        enrollment,
        enrollment.enrollment_status[0].enrollment_status_type
      );

      return NextResponse.json(
        {
          error:
            enrollment.enrollment_status[0].enrollment_status_type == "Sent"
              ? "Status alterado para Confirmado"
              : "Status mantido como Confirmado",
        },
        { status: 200 }
      );
    } else {
      return NextResponse.json(
        {
          error:
            enrollment.enrollment_status[0].enrollment_status_type == "Sent"
              ? "Aluno inscrito em outro curso. Status mantido como Inscrito"
              : "Aluna inscrita em outro curso. Status alterado para Inscrito",
        },
        { status: 200 }
      );
      // await updateEnrollmentStatusIfNecessary(enrollment, null);
    }
  } else {
    return NextResponse.json(
      {
        error:
          enrollment.enrollment_status[0].enrollment_status_type == "Sent"
            ? "Aluno não inscrito em curso. Status mantido como Inscrito"
            : "Aluno não inscrito em curso. Status alterado para Inscrito",
      },
      { status: 200 }
    );
    // await updateEnrollmentStatusIfNecessary(enrollment, null);
  }
}
