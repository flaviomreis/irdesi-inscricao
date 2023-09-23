import { prisma } from "@/db/connection";
import isAdministrator from "@/utils/is-administrator";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "../../auth/[...nextauth]/route";
import sendMoodleRequest from "@/utils/moodle-request";

export function getStatusType(
  enrollmentConfirmedAt: Date | null,
  courseLastAccess: Date | number | null,
  courseProgress: number
) {
  const statusType = courseLastAccess
    ? courseProgress < 100
      ? "Active"
      : "Completed"
    : !enrollmentConfirmedAt
    ? "Sent"
    : "Confirmed";

  return statusType;
}

export async function updateEnrollmentStatusIfNecessary(
  enrollment_id: string,
  actualStatusType: string,
  enrollmentConfirmedAt: Date | null,
  courseLastAccess: number | null,
  courseProgress: number
) {
  const newStatusType = getStatusType(
    enrollmentConfirmedAt,
    courseLastAccess,
    courseProgress
  );

  if (courseLastAccess) {
    await prisma.enrollment.update({
      where: {
        id: enrollment_id,
      },
      data: {
        // confirmed_at:
        //   enrollmentConfirmedAt ?? new Date(courseLastAccess * 1000),
        last_access_at: new Date(courseLastAccess * 1000),
        progress: courseProgress,
      },
    });
  } else {
    if (!enrollmentConfirmedAt) {
      await updateEnrollmentToSent(enrollment_id);
    }
  }

  return newStatusType;
}

export type StudentProps = {
  studentId: string;
  cpf: string;
  actual: {
    email: string;
    name: string;
    lastName: string;
  };
  moodle: {
    email: string;
    name: string;
    lastName: string;
  };
};

export async function updateUserIfNecessary(data: StudentProps) {
  if (JSON.stringify(data.actual) !== JSON.stringify(data.moodle)) {
    await prisma.student.update({
      where: {
        id: data.studentId,
      },
      data: {
        email: data.moodle.email,
        name: data.moodle.name,
        last_name: data.moodle.lastName,
      },
    });
    return data;
  }
}

async function updateEnrollmentToSent(enrollment_id: string) {
  // await prisma.enrollment.update({
  //   where: {
  //     id: enrollment_id,
  //   },
  //   data: {
  //     confirmed_at: null,
  //     last_access_at: null,
  //     progress: 0,
  //   },
  // });
  console.log("Algum muito estranho: Status retornado para Sent");
}

async function getEnrollment(id: string) {
  const result = await prisma.enrollment.findUnique({
    where: {
      id,
    },
    include: {
      student: true,
    },
  });

  return result;
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
      { status: 404 }
    );
  }

  if (!Array.isArray(findUserJson)) {
    return NextResponse.json(
      {
        error: "Erro na resposta do Moodle, era esperada uma coleção de alunos",
      },
      { status: 404 }
    );
  }

  // const statusType = !enrollment.confirmed_at
  //   ? "Sent"
  //   : !enrollment.last_access_at
  //   ? "Confirmed"
  //   : enrollment.progress < 100
  //   ? "Active"
  //   : "Completed";

  const statusType = getStatusType(
    enrollment.confirmed_at,
    enrollment.last_access_at,
    enrollment.progress
  );

  if (findUserJson.length === 0) {
    await updateEnrollmentToSent(enrollment.id);
    return NextResponse.json(
      {
        error:
          statusType === "Sent"
            ? "Aluno não criado no Moodle. Inscrição mantida como Enviada"
            : "Aluna não criado no Moodle. Inscrição alterada para Enviada",
      },
      { status: 200 }
    );
  } else if (findUserJson.length != 1) {
    return NextResponse.json(
      {
        error:
          "Erro na resposta do Moodle, era esperada uma coleção com apenas um aluno",
      },
      { status: 404 }
    );
  }

  const userData: StudentProps = {
    studentId: enrollment.student_id,
    cpf: findUserJson[0].username,
    actual: {
      email: enrollment.student.email,
      name: enrollment.student.name,
      lastName: enrollment.student.last_name,
    },
    moodle: {
      email: findUserJson[0].email,
      name: findUserJson[0].firstname,
      lastName: findUserJson[0].lastname,
    },
  };

  const studentData = await updateUserIfNecessary(userData);

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
      {
        error: "Erro ao tentar buscar inscrições do aluno no Moodle",
        studentData,
      },
      { status: 404 }
    );
  }

  if (!Array.isArray(findCoursesJson)) {
    return NextResponse.json(
      {
        error: "Erro na resposta do Moodle, era esperada uma coleção de cursos",
        studentData,
      },
      { status: 404 }
    );
  }

  if (findCoursesJson.length > 0) {
    const index = findCoursesJson.findIndex((course) => course.id == moodle_id);

    if (index >= 0) {
      const courseLastAccess = findCoursesJson[index].lastaccess;
      const courseProgress = findCoursesJson[index].progress;

      const actualStatusType = getStatusType(
        enrollment.confirmed_at,
        enrollment.last_access_at,
        enrollment.progress
      );
      const newStatusType = await updateEnrollmentStatusIfNecessary(
        enrollment.id,
        actualStatusType,
        enrollment.confirmed_at,
        courseLastAccess,
        courseProgress
      );

      const newStatusTypePtBR =
        newStatusType === "Sent"
          ? "Enviada"
          : newStatusType === "Confirmed"
          ? "Confirmada"
          : newStatusType === "Active"
          ? "Ativa"
          : "Concluída";

      return NextResponse.json(
        {
          error:
            statusType !== newStatusType
              ? `Inscrição alterada para ${newStatusTypePtBR}`
              : `Inscrição mantida como ${newStatusTypePtBR}`,
          studentData,
        },
        { status: 200 }
      );
    } else {
      await updateEnrollmentToSent(enrollment.id);
      return NextResponse.json(
        {
          error:
            statusType === "Sent"
              ? "Aluno inscrito em outro curso. Inscrição mantida como Enviada"
              : "Aluna inscrita em outro curso. Inscrição alterada para Enviada",
          studentData,
        },
        { status: 200 }
      );
    }
  } else {
    await updateEnrollmentToSent(enrollment.id);
    return NextResponse.json(
      {
        error:
          statusType === "Sent"
            ? "Aluno não inscrito em curso. Inscrição mantida como Enviada"
            : "Aluno não inscrito em curso. Inscrição alterada para Enviada",
        studentData,
      },
      { status: 200 }
    );
  }
}
