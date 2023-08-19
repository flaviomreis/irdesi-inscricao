import {
  CourseClassStudentsDAO,
  CourseClassStudentsDAOArray,
  EnrollmentStatusType,
} from "@/app/dao/CourseClassStudentsDAO";
import CourseClassStudentsList from "@/components/CourseClassStudentsList";
import DownloadButton from "@/components/DownloadButton";
import { prisma } from "@/db/connection";
import { Metadata } from "next";
import { useRouter } from "next/navigation";

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
  const courseClass = await getCourseClass(courseClassId);
  const dao: CourseClassStudentsDAO[] = [];
  const daoArray: CourseClassStudentsDAOArray[] = [];
  if (courseClass) {
    courseClass.enrollment.map((enrollment) => {
      dao.push({
        id: enrollment.id,
        status: enrollment.enrollment_status[0]
          .enrollment_status_type as EnrollmentStatusType,
        email: enrollment.student.email,
        cpf: enrollment.student.cpf,
        name: enrollment.student.name,
        lastName: enrollment.student.last_name,
        selected: false,
        error: null,
      });

      // daoArray.push({
      //   id: enrollment.id,
      //   data: {
      //     status: enrollment.enrollment_status[0].enrollment_status_type
      //       .name as EnrollmentStatusType,
      //     email: enrollment.student.email,
      //     cpf: enrollment.student.cpf,
      //     name: enrollment.student.name,
      //     lastName: enrollment.student.last_name,
      //     selected: false,
      //   },
      // });
    });
  }

  return (
    <div className="flex flex-1 flex-col gap-2">
      <h2>Contrato: {courseClass?.institution.short_name}</h2>
      <h2>
        Turma: {courseClass?.course.short_name} ({courseClass?.description})
      </h2>
      <h2>Estudantes:</h2>
      <CourseClassStudentsList
        courseClassId={courseClassId}
        dao={dao}
        city={courseClass?.institution.short_name!}
      />
    </div>
  );
}
