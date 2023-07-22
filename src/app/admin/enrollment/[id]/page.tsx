import EnrollmentForm from "@/components/EnrollmentForm";
import EnrollmentWithEmployeeIdForm from "@/components/EnrollmentWithEmployeeIdForm";
import { prisma } from "@/db/connection";
import { baseUrl } from "@/utils/baseurl";

async function getEnrollment(id: string) {
  const result = await prisma.enrollment.findUnique({
    where: {
      id,
    },
    include: {
      student: true,
      course_class: {
        include: {
          course: true,
          institution: true,
        },
      },
    },
  });
  return result;
}

export default async function AdminEnrollmentUpdatePage({
  params,
}: {
  params: { id: string };
}) {
  const enrollmentId = params.id;
  const enrollment = await getEnrollment(enrollmentId);

  const student = {
    name: enrollment!.student.name,
    lastName: enrollment!.student.last_name,
    email: enrollment!.student.email,
    cpf: enrollment!.student.cpf,
    employeeId: enrollment!.student.employeeId!,
  };

  return (
    <div>
      <h1 className="flex justify-center text-lg text-gray-700">
        Turma: {enrollment?.course_class.institution.short_name} /{" "}
        {enrollment?.course_class.course.short_name} (
        {enrollment?.course_class.description})
      </h1>
      <h2 className="flex justify-center text-lg">Dados dos Estudante</h2>
      {!enrollment?.course_class.requireemployeeId ? (
        <EnrollmentForm
          courseClassId={enrollment!.course_class_id}
          action={`${baseUrl}/api/enrollment/`}
          method="PUT"
          student={student}
          studentId={enrollment?.student_id}
        />
      ) : (
        <EnrollmentWithEmployeeIdForm
          courseClassId={enrollment!.course_class_id}
          action={`${baseUrl}/api/enrollment/`}
          method="PUT"
          student={student}
          studentId={enrollment?.student_id}
        />
      )}
    </div>
  );
}
