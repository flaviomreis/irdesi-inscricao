import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "../auth/[...nextauth]/route";
import isAdministrator from "@/utils/is-administrator";
import { CourseClassStudentsDAO } from "@/app/dao/CourseClassStudentsDAO";
import { prisma } from "@/db/connection";
import sendMoodleRequest from "@/utils/moodle-request";

async function setEnrollmentStatusAsConfirmed(id: string, status: string) {
  if (status == "Sent") {
    await prisma.enrollment.update({
      where: {
        id,
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

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (
    !session ||
    !session.user ||
    !(await isAdministrator(session.user.email))
  ) {
    return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
  }

  const body = await request.json();
  const item = body.item as CourseClassStudentsDAO;
  const city = body.city;

  // Consulta se estudante já existe com o CPF como username
  const findUserParams = {
    wstoken: process.env.MOODLE_GET_TOKEN!,
    wsfunction: "core_user_get_users_by_field",
    moodlewsrestformat: "json",
    field: "username",
    "values[0]": item.cpf,
  };

  const findUserJson = await sendMoodleRequest(findUserParams);
  let userId = "";
  let userExists = false;
  let userEnrolled = false;

  // Se não existe um estudante com o CPF como username
  if (!Array.isArray(findUserJson) || findUserJson.length < 1) {
    const userParams = {
      wstoken: process.env.MOODLE_CREATE_USER_TOKEN!,
      wsfunction: "core_user_create_users",
      moodlewsrestformat: "json",
      "users[0][username]": item.cpf,
      "users[0][createpassword]": 1,
      "users[0][firstname]": item.name,
      "users[0][lastname]": item.lastName,
      "users[0][email]": item.email,
      "users[0][city]": city,
      "users[0][timezone]": "America/Sao_Paulo",
      "users[0][country]": "BR",
    };

    const userJson = await sendMoodleRequest(userParams);

    if (!Array.isArray(userJson)) {
      console.log("error", userJson);
      return NextResponse.json(
        { error: "Ocorreu um erro ao tentar cadastrar o aluno no Moodle." },
        { status: 500 }
      );
    }

    console.log("userJson", userJson);
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

    const findEnrollJson = await sendMoodleRequest(findEnrollParams);

    if (Array.isArray(findEnrollJson)) {
      const index = findEnrollJson.findIndex((item) => item.id == 2);

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
      "enrolments[0][courseid]": 2,
    };

    const enrollJson = await sendMoodleRequest(enrollParams);

    if (enrollJson != null) {
      console.log("error", enrollJson);
      if (!userExists) {
        return NextResponse.json(
          {
            error:
              "Ocorreu um erro ao tentar inscrever o aluno, recém criado, no curso",
          },
          { status: 500 }
        );
      } else {
        return NextResponse.json(
          {
            error:
              "Ocorreu um erro ao tentar inscrever o aluno, já existente, no curso",
          },
          { status: 500 }
        );
      }
    }
  } else {
    return NextResponse.json(
      {
        error: "O aluno já existe e já está inscrito no curso",
      },
      { status: 200 }
    );
  }

  setEnrollmentStatusAsConfirmed(item.id, item.status);

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
