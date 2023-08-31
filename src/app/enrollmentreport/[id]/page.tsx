import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import UserAuthBar from "@/components/UserAuthBar";
import EnrollmentReportList from "@/components/enrollmentreport/EnrollmentReportList";
import PreEnrollmentReportList from "@/components/enrollmentreport/PreEnrollmentReportList";
import { prisma } from "@/db/connection";
import NextAuthProvider from "@/providers/auth";
import isAdministrator from "@/utils/is-administrator";
import plural from "@/utils/plural";
import { Prisma } from "@prisma/client";
import { Metadata } from "next";
import { getServerSession } from "next-auth";
import Image from "next/image";

export const metadata: Metadata = {
  title: "Irdesi - Relatório de Alunos de Turma",
};

export type EnrollmentReportItem = {
  student_id: string;
  cpf: string;
  email: string;
  name: string;
  lastName: string;
  lastStatus: string;
  employeeId: string | null;
  preenrollmentDate: Date;
  confirmationDate: Date | null;
  lastAccessDate: Date | null;
  progress: Number | null;
};

type CourseClassPayload = {
  include: {
    enrollment: {
      include: {
        student: true;
        enrollment_status: {
          take: 1;
          orderBy: {
            created_at: "desc";
          };
        };
      };
    };
    institution: true;
    course: true;
    course_class_administrators: true;
  };
};

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
      },
      institution: true,
      course: true,
      course_class_administrators: true,
    },
  });
  return result;
}

type CourseClassData = Prisma.CourseClassGetPayload<CourseClassPayload>;

function fillReportItems(courseClass: CourseClassData) {
  const reportItems: EnrollmentReportItem[] = [];
  const preEnrollmentItems: EnrollmentReportItem[] = [];

  if (courseClass) {
    courseClass.enrollment.map((item) => {
      const obj: EnrollmentReportItem = {
        student_id: item.student_id,
        cpf: item.student.cpf,
        email: item.student.email,
        employeeId: item.student.employeeId,
        name: item.student.name,
        lastName: item.student.last_name,
        lastStatus: item.enrollment_status[0].enrollment_status_type,
        preenrollmentDate: item.created_at,
        confirmationDate: item.enrollment_status[0].created_at,
        lastAccessDate: null,
        progress: null,
      };

      if (item.enrollment_status[0].enrollment_status_type !== "Sent") {
        reportItems.push(obj);
      } else {
        preEnrollmentItems.push({ ...obj, confirmationDate: null });
      }
    });
  }
  return [reportItems, preEnrollmentItems];
}

export default async function EnrollmentReport({
  params,
}: {
  params: { id: string };
}) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return (
      <NextAuthProvider>
        <div className="container mx-auto p-4">
          <UserAuthBar link={false} />
        </div>
      </NextAuthProvider>
    );
  }

  const courseClass = await getCourseClass(params.id);

  if (!courseClass) {
    return <div>Turma não encontrada!</div>;
  }

  if (!isAdministrator(session.user?.email)) {
    const courseClassAdministrators =
      courseClass.course_class_administrators.find(
        (item) => item.email === session.user?.email
      );

    if (!courseClassAdministrators) {
      return (
        <NextAuthProvider>
          <div className="container mx-auto p-4">
            <UserAuthBar link={false} />
            <p>Usuário não autorizado</p>
          </div>
        </NextAuthProvider>
      );
    }
  }

  let reportItems: EnrollmentReportItem[] = [];
  let preEnrollmentItems: EnrollmentReportItem[] = [];
  if (courseClass) {
    [reportItems, preEnrollmentItems] = fillReportItems(courseClass);
  }

  return (
    <NextAuthProvider>
      <UserAuthBar link={false} />
      <div className="flex flex-col gap-2 justify-items-center items-center text-center p-2">
        <Image
          src="/logo-v2.png"
          alt="Logo Campi-Irdesi"
          width={200}
          height={40}
          priority
        />

        <p className="text-orange-700 text-lg">
          Contrato: {courseClass.institution.short_name}
        </p>
        <p className="text-violet-800 text-lg">
          Turma: {courseClass.course.name} ({courseClass.description})<br />
          {courseClass.amountOfStudents} vagas
        </p>
      </div>

      <div className="flex flex-col gap-2 justify-items-center items-center text-center p-2">
        <p className="text-yellow-600 text-lg">
          Relação de Alunos Não Matriculados (
          {plural("inscrição", preEnrollmentItems.length)})
        </p>
      </div>
      <PreEnrollmentReportList
        items={preEnrollmentItems}
        courseClassId={courseClass.id}
      />

      <div className="flex flex-col gap-2 justify-items-center items-center text-center p-2 mt-4">
        <p className="text-blue-600 text-lg">
          Relação de Alunos Matriculados (
          {plural("inscrição", reportItems.length)})
        </p>
      </div>
      <EnrollmentReportList
        items={reportItems}
        courseClassId={courseClass.id}
      />
    </NextAuthProvider>
  );
}
