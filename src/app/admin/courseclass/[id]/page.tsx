import {
  CourseClassStudentsDAO,
  EnrollmentStatusType,
} from "@/app/dao/CourseClassStudentsDAO";
import CourseClassStudents from "@/components/CourseClassStudents";
import { prisma } from "@/db/connection";
import { Metadata } from "next";
import { useFormatter } from "next-intl";

export const metadata: Metadata = {
  title: "Irdesi - Administração de Pré-Inscrições",
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

export default async function AdminCourseClassPage({
  params,
}: {
  params: { id: string };
}) {
  const courseClassId = params.id;
  const dtFormatter = new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  });

  const courseClass = await getCourseClass(courseClassId);
  const dao: CourseClassStudentsDAO[] = [];
  let sentTotal = 0;
  let confirmedTotal = 0;

  if (courseClass) {
    courseClass.enrollment.map((enrollment) => {
      const status = enrollment.enrollment_status[0]
        .enrollment_status_type as EnrollmentStatusType;

      dao.push({
        id: enrollment.id,
        status,
        email: enrollment.student.email,
        cpf: enrollment.student.cpf,
        name: enrollment.student.name,
        lastName: enrollment.student.last_name,
        created_at: dtFormatter.format(enrollment.created_at),
        selected: false,
        error: null,
      });
      status == "Sent" && sentTotal++;
      status == "Confirmed" && confirmedTotal++;
    });
  }

  return (
    courseClass && (
      <div className="flex flex-1 flex-col gap-2">
        <h2>Contrato: {courseClass.institution.short_name}</h2>
        <h2>
          Turma: {courseClass.course.short_name} ({courseClass.description})
        </h2>
        <h2>Estudantes:</h2>
        <CourseClassStudents
          courseClassId={courseClassId}
          courseClassMoodleId={courseClass.course.moodle_id}
          dao={dao}
          city={courseClass?.institution.short_name!}
          total={{ sentTotal, confirmedTotal }}
        />
      </div>
    )
  );
}
