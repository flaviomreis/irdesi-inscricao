import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "../../auth/[...nextauth]/route";
import isAdministrator from "@/utils/is-administrator";
import { prisma } from "@/db/connection";
import sendMoodleRequest from "@/utils/moodle-request";

const conn = prisma;

async function setEnrollmentStatusAsConfirmed(
  courseClassId: string,
  studentId: string
) {
  const enrollment = await conn.enrollment.findUnique({
    where: {
      enrollment: {
        course_class_id: courseClassId,
        student_id: studentId,
      },
    },
    include: {
      enrollment_status: {
        take: 1,
        orderBy: {
          created_at: "desc",
        },
      },
    },
  });

  if (
    enrollment &&
    enrollment.enrollment_status[0].enrollment_status_type === "Sent"
  ) {
    await conn.enrollment.update({
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
  return await conn.courseClass.findUnique({
    where: {
      id,
    },
    include: {
      course_class_administrators: true,
      course: true,
      institution: true,
    },
  });
}

async function getStudent(id: string) {
  return await conn.student.findUnique({
    where: {
      id,
    },
  });
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    return NextResponse.json({ error: "Acesso negado" }, { status: 401 });
  }

  const course_id = request.nextUrl.searchParams.get("course_id") as string;
  const courseClass = await getCourseClass(course_id);

  if (!courseClass) {
    return NextResponse.json(
      { error: "ID de Turma inválido" },
      { status: 400 }
    );
  }

  const student_id = params.id;

  if (!student_id) {
    return NextResponse.json(
      { error: "O ID do estudante é necessário" },
      { status: 400 }
    );
  }

  const isAdmin = await isAdministrator(session.user.email);
  const isCourseAdministrator = courseClass.course_class_administrators.find(
    (item) => item.email === session.user?.email
  );

  console.log(session.user.email, !isAdmin && !isCourseAdministrator);

  if (!isAdmin && !isCourseAdministrator) {
    return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
  }

  const student = await getStudent(student_id);

  if (!student) {
    return NextResponse.json(
      { error: "ID de Estudante inválido" },
      { status: 400 }
    );
  }

  // Consulta se estudante já existe com o CPF como username
  const findUserParams = {
    wstoken: process.env.MOODLE_GET_TOKEN!,
    wsfunction: "core_user_get_users_by_field",
    moodlewsrestformat: "json",
    field: "username",
    "values[0]": student.cpf,
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

  let userId = "";
  let userExists = false;
  let userEnrolled = false;

  // Se não existe um estudante com o CPF como username
  if (!Array.isArray(findUserJson) || findUserJson.length < 1) {
    const userParams = {
      wstoken: process.env.MOODLE_CREATE_USER_TOKEN!,
      wsfunction: "core_user_create_users",
      moodlewsrestformat: "json",
      "users[0][username]": student.cpf,
      "users[0][createpassword]": 1,
      "users[0][firstname]": student.name,
      "users[0][lastname]": student.last_name,
      "users[0][email]": student.email,
      "users[0][city]": courseClass.institution.short_name,
      "users[0][timezone]": "America/Sao_Paulo",
      "users[0][country]": "BR",
    };

    const { result, json: userJson } = await sendMoodleRequest(userParams);
    if (!result.ok) {
      return NextResponse.json(
        { error: "Ocorreu um erro ao tentar criar o aluno no Moodle." },
        { status: 404 }
      );
    }

    userId = userJson[0].id;
  } else {
    userId = findUserJson[0].id;
    userExists = true;

    const findEnrollParams = {
      wstoken: process.env.MOODLE_GET_TOKEN!,
      wsfunction: "core_enrol_get_users_courses",
      moodlewsrestformat: "json",
      userid: userId,
    };

    const { result, json: findEnrollJson } = await sendMoodleRequest(
      findEnrollParams
    );

    if (!result.ok) {
      return NextResponse.json(
        {
          error:
            "Ocorreu um erro ao tentar buscar inscrição do aluno no curso do Moodle.",
        },
        { status: 404 }
      );
    }

    if (Array.isArray(findEnrollJson)) {
      const index = findEnrollJson.findIndex(
        (item) => item.id === courseClass.course.moodle_id
      );

      if (index >= 0) {
        userEnrolled = true;
      }
    }
  }

  if (!userEnrolled) {
    const enrollParams = {
      wstoken: process.env.MOODLE_ENROLL_USER_TOKEN!,
      wsfunction: "enrol_manual_enrol_users",
      moodlewsrestformat: "json",
      "enrolments[0][roleid]": 5,
      "enrolments[0][userid]": userId,
      "enrolments[0][courseid]": courseClass.course.moodle_id,
    };

    const { result, json: enrollJson } = await sendMoodleRequest(enrollParams);
    if (!result.ok) {
      return NextResponse.json(
        {
          error:
            "Ocorreu um erro ao tentar inscrever o aluno no curso do Moodle.",
        },
        { status: 404 }
      );
    }

    if (enrollJson != null) {
      console.log("error", enrollJson);
      if (!userExists) {
        return NextResponse.json(
          {
            error:
              "Ocorreu um erro ao tentar inscrever o aluno, recém criado, no curso",
          },
          { status: 404 }
        );
      } else {
        return NextResponse.json(
          {
            error:
              "Ocorreu um erro ao tentar inscrever o aluno, já existente, no curso",
          },
          { status: 404 }
        );
      }
    }
  } else {
    return NextResponse.json(
      {
        error: "O aluno já existe e já está inscrito no curso",
      },
      { status: 404 }
    );
  }

  setEnrollmentStatusAsConfirmed(courseClass.id, student.id);

  if (!userExists) {
    return NextResponse.json(
      { error: "O aluno foi recém criado e inscrito no curso com sucesso" },
      { status: 200 }
    );
  } else {
    return NextResponse.json(
      { error: "O aluno, já existente, foi inscrito no curso com sucesso" },
      { status: 200 }
    );
  }
}
