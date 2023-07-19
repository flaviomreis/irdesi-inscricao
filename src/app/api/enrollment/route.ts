import { prisma } from "@/db/connection";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const courseClassId = body.courseClassId;

  if (!courseClassId) {
    return NextResponse.json(body, {
      status: 401,
      statusText: `Um id de turma precisa ser enviado.`,
    });
  }

  const foundCourseClass = await prisma.courseClass.findUnique({
    where: {
      id: courseClassId,
    },
  });

  if (!foundCourseClass) {
    return NextResponse.json(body, {
      status: 401,
      statusText: `A turma ${courseClassId} não existe.`,
    });
  }

  const studentEmail = body.student.email;

  if (!studentEmail) {
    return NextResponse.json(body, {
      status: 401,
      statusText: `O email do estudante não pode ser em branco.`,
    });
  }

  const studentName = body.student.name;

  if (!studentName) {
    return NextResponse.json(body, {
      status: 401,
      statusText: `O nome do estudante não pode ser em branco.`,
    });
  }

  const studentCPF = body.student.cpf;

  if (!studentCPF) {
    return NextResponse.json(body, {
      status: 401,
      statusText: `O CPF do estudante não pode ser em branco.`,
    });
  }

  const foundStudentByEmail = await prisma.student.findUnique({
    where: {
      email: studentEmail,
    },
  });

  if (foundStudentByEmail && foundStudentByEmail.cpf !== studentCPF) {
    return NextResponse.json(body, {
      status: 401,
      statusText: `O email ${studentEmail} já está cadastrado com outro CPF.`,
    });
  }

  const foundStudentByCPF = await prisma.student.findUnique({
    where: {
      cpf: studentCPF,
    },
  });

  if (foundStudentByCPF && foundStudentByCPF.email !== studentEmail) {
    return NextResponse.json(body, {
      status: 401,
      statusText: `O CPF ${studentCPF} já está cadastrado com outro email.`,
    });
  }

  if (!foundStudentByEmail) {
    await prisma.student.create({
      data: {
        name: studentName,
        email: studentEmail,
        cpf: studentCPF,
        employeeId: body.student.employeeId,
      },
    });
  }

  const student = await prisma.student.findUnique({
    where: {
      email: studentEmail,
    },
  });

  if (!student) {
    return NextResponse.json(body, {
      status: 500,
      statusText: `Não foi possível inserir o estudante ${studentEmail}.`,
    });
  }

  const foundEnrollment = await prisma.enrollment.findUnique({
    where: {
      enrollment: {
        course_class_id: foundCourseClass.id,
        student_id: student.id,
      },
    },
  });

  if (foundEnrollment) {
    return NextResponse.json(body, {
      status: 401,
      statusText: `O estudante ${studentEmail} já está pré-inscrito na turma.`,
    });
  }

  const enrollment = await prisma.enrollment.create({
    data: {
      course_class_id: foundCourseClass.id,
      student_id: student.id,
    },
  });

  console.log({ foundCourseClass, student, enrollment });

  return NextResponse.json({
    statusText: `Pré-inscrição enviada com sucesso. Por favor, aguarde confirmação.`,
  });
}
