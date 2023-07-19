import { prisma } from "@/db/connection";
import { Metadata } from "next";
import Link from "next/link";

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

  return (
    <div className="flex flex-col gap-2">
      <h2>Contrato: {courseClass?.institution.short_name}</h2>
      <h2>
        Turma: {courseClass?.course.short_name} ({courseClass?.description})
      </h2>
      <ul className="list-disc pl-4 gap-2 flex flex-col">
        {courseClass?.enrollment.map((enrollment) => {
          return (
            <li key={enrollment.id}>
              {enrollment.student.name},{enrollment.student.email},
              {enrollment.student.cpf}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
