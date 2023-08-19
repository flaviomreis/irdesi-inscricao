import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "../auth/[...nextauth]/route";
import isAdministrator from "@/utils/is-administrator";
import { CourseClassStudentsDAO } from "@/app/dao/CourseClassStudentsDAO";

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
    return NextResponse.json({ error: "ERR:1" }, { status: 400 });
  }

  if (userJson.length != 1) {
    console.log("error", userJson);
    return NextResponse.json({ error: "ERR:2" }, { status: 500 });
  }

  console.log("userJson", userJson);

  const enrollParams = {
    wstoken: process.env.MOODLE_ENROLL_USER_TOKEN!,
    wsfunction: "enrol_manual_enrol_users",
    moodlewsrestformat: "json",
    "enrolments[0][roleid]": 5,
    "enrolments[0][userid]": userJson[0].id,
    "enrolments[0][courseid]": 2,
  };

  const enrollJson = await sendMoodleRequest(enrollParams);

  if (enrollJson != null) {
    console.log("error", userJson);
    return NextResponse.json({ error: "ERR:3" }, { status: 500 });
  }

  return NextResponse.json({ error: "Ok" }, { status: 200 });
}

async function sendMoodleRequest(params: any) {
  const formBody = [];
  for (const [key, value] of Object.entries(params)) {
    var encodedKey = encodeURIComponent(key);
    var encodedValue = encodeURIComponent(value as string | number);
    formBody.push(encodedKey + "=" + encodedValue);
  }
  const formBodyString = formBody.join("&");

  const result = await fetch(
    "https://irdesieducacao.com.br/ava/webservice/rest/server.php",
    {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: formBodyString,
    }
  );
  const json = await result.json();
  return json;
}
