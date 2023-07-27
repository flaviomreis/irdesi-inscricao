import {
  CourseClassStudentsDAO,
  EnrollmentStatusType,
} from "@/app/dao/CourseClassStudentsDAO";
import CourseClassStudentsList from "@/components/CourseClassStudentsList";
import DownloadButton from "@/components/DownloadButton";
import { prisma } from "@/db/connection";
import { Metadata } from "next";

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
            include: {
              enrollment_status_type: true,
            },
          },
        },
        take: 10,
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
  const courseClass = await getCourseClass(courseClassId);
  const dao: CourseClassStudentsDAO[] = [];
  if (courseClass) {
    courseClass.enrollment.map((enrollment) => {
      dao.push({
        id: enrollment.id,
        status: enrollment.enrollment_status[0].enrollment_status_type
          .name as EnrollmentStatusType,
        email: enrollment.student.email,
        cpf: enrollment.student.cpf,
        name: enrollment.student.name,
        lastName: enrollment.student.last_name,
      });
    });
  }

  return (
    <div className="flex flex-col gap-2">
      <h2>Contrato: {courseClass?.institution.short_name}</h2>
      <h2>
        Turma: {courseClass?.course.short_name} ({courseClass?.description})
      </h2>
      <h2>Estudantes (10 primeiros)</h2>

      <CourseClassStudentsList dao={dao} />
      <DownloadButton courseClassId={courseClassId} />
    </div>
  );
}
