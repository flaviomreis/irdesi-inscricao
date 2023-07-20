import { prisma } from "@/db/connection";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const courseClassId = body.courseClassId;

  console.log(body.student);

  if (!courseClassId) {
    return NextResponse.json(
      { error: "`Um id de turma precisa ser enviado." },
      {
        status: 401,
      }
    );
  }

  const foundCourseClass = await prisma.courseClass.findUnique({
    where: {
      id: courseClassId,
    },
  });

  if (!foundCourseClass) {
    return NextResponse.json(
      { error: `A turma ${courseClassId} não existe.` },
      {
        status: 401,
      }
    );
  }

  const studentEmail = body.student.email;

  if (!studentEmail) {
    return NextResponse.json(
      { error: "`O email não pode ser em branco." },
      {
        status: 401,
      }
    );
  }

  const studentName = body.student.name;

  if (!studentName) {
    return NextResponse.json(
      { error: "`O nome não pode ser em branco." },
      {
        status: 401,
      }
    );
  }

  const studentLastName = body.student.lastName;

  if (!studentLastName) {
    return NextResponse.json(
      { error: "`O sobrenome não pode ser em branco." },
      {
        status: 401,
      }
    );
  }

  const studentCPF = body.student.cpf;

  if (!studentCPF) {
    return NextResponse.json(
      { error: "`O CPF não pode ser em branco." },
      {
        status: 401,
      }
    );
  }

  const foundStudentByEmail = await prisma.student.findUnique({
    where: {
      email: studentEmail,
    },
  });

  if (foundStudentByEmail && foundStudentByEmail.cpf !== studentCPF) {
    return NextResponse.json(
      { error: `Email ${studentEmail} vinculado a outro CPF.` },
      {
        status: 401,
      }
    );
  }

  const foundStudentByCPF = await prisma.student.findUnique({
    where: {
      cpf: studentCPF,
    },
  });

  if (foundStudentByCPF && foundStudentByCPF.email !== studentEmail) {
    return NextResponse.json(
      { error: `CPF ${studentCPF} vinculado a outro email.` },
      {
        status: 401,
      }
    );
  }

  if (!foundStudentByEmail) {
    await prisma.student.create({
      data: {
        name: studentName,
        last_name: studentLastName,
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
    return NextResponse.json(
      { error: `Falha ao pré-inscrever ${studentEmail}.` },
      {
        status: 500,
      }
    );
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
    return NextResponse.json(
      {
        error: `Estudante ${studentEmail} já tem pré-inscrição nesta turma.`,
      },
      {
        status: 401,
      }
    );
  }

  const enrollment = await prisma.enrollment.create({
    data: {
      course_class_id: foundCourseClass.id,
      student_id: student.id,
    },
  });

  return NextResponse.json(
    {
      error: `Pré-inscrição enviada com sucesso. Por favor, aguarde confirmação.`,
    },
    { status: 201 }
  );
}
