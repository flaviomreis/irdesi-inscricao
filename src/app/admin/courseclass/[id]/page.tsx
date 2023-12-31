import {
  CourseClassStudentsDAO,
  EnrollmentStatusType,
} from "@/dao/CourseClassStudentsDAO";
import CourseClassStudents from "@/components/CourseClassStudents";
import { prisma } from "@/db/connection";
import { Metadata } from "next";
import dtFormatter from "@/utils/date-formatter";
import plural from "@/utils/plural";

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
        },
        orderBy: [
          {
            student: {
              name: "asc",
            },
          },
          {
            student: {
              last_name: "asc",
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
  let sentTotal = 0;
  let confirmedTotal = 0;
  let activeTotal = 0;
  let completedTotal = 0;

  if (courseClass) {
    courseClass.enrollment.map((enrollment) => {
      // const status = enrollment.enrollment_status[0]
      //   .enrollment_status_type as EnrollmentStatusType;
      const status = !enrollment.confirmed_at
        ? "Sent"
        : !enrollment.last_access_at
        ? "Confirmed"
        : enrollment.progress < 100
        ? "Active"
        : "Completed";

      dao.push({
        id: enrollment.id,
        status,
        email: enrollment.student.email,
        cpf: enrollment.student.cpf,
        name: enrollment.student.name,
        lastName: enrollment.student.last_name,
        created_at: dtFormatter.format(enrollment.created_at),
        progress: enrollment.progress.toFixed(2),
        selected: false,
        error: null,
      });
      status === "Sent" && sentTotal++;
      status === "Confirmed" && confirmedTotal++;
      status === "Active" && activeTotal++;
      status === "Completed" && completedTotal++;
    });
  }

  return (
    courseClass && (
      <div className="flex flex-1 flex-col gap-2">
        <h2>Contrato: {courseClass.institution.short_name}</h2>
        <h2>
          Turma: {courseClass.course.short_name} ({courseClass.description}){" "}
          {plural("vaga", courseClass.amountOfStudents)}
        </h2>
        <h2>Estudantes:</h2>
        <CourseClassStudents
          courseClassId={courseClassId}
          courseClassMoodleId={courseClass.course.moodle_id}
          dao={dao}
          city={courseClass.institution.short_name!}
          moodle_id={courseClass.course.moodle_id}
          total={{ sentTotal, confirmedTotal, activeTotal, completedTotal }}
        />
      </div>
    )
  );
}
