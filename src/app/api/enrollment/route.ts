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
      statusText: `O email não pode ser em branco.`,
    });
  }

  const studentName = body.student.name;

  if (!studentName) {
    return NextResponse.json(body, {
      status: 401,
      statusText: `O nome não pode ser em branco.`,
    });
  }

  const studentCPF = body.student.cpf;

  if (!studentCPF) {
    return NextResponse.json(body, {
      status: 401,
      statusText: `O CPF não pode ser em branco.`,
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
      statusText: `Email ${studentEmail} vinculado a outro CPF.`,
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
      statusText: `CPF ${studentCPF} vinculado a outro email.`,
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
  } else {
    await prisma.student.update({
      where: {
        id: foundStudentByEmail.id,
      },
      data: {
        name: studentName,
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
      statusText: `Falha ao pré-inscrever ${studentEmail}.`,
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
      statusText: `Estudante ${studentEmail} já tem pré-inscrição nesta turma.`,
    });
  }

  const enrollment = await prisma.enrollment.create({
    data: {
      course_class_id: foundCourseClass.id,
      student_id: student.id,
    },
  });

  return NextResponse.json({
    statusText: `Pré-inscrição enviada com sucesso. Por favor, aguarde confirmação.`,
  });
}
