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
      <h2>Estudantes</h2>
      <table className="table-auto text-left">
        <thead>
          <tr>
            <th>CPF</th>
            <th>email</th>
            <th>Nome</th>
            <th>Sobrenome</th>
          </tr>
        </thead>
        <tbody>
          {courseClass?.enrollment.map((enrollment) => {
            return (
              <tr key={enrollment.id}>
                <td>
                  <Link href={`/admin/enrollment/${enrollment.id}`}>
                    {enrollment.student.cpf}
                  </Link>
                </td>
                <td>{enrollment.student.email}</td>
                <td>{enrollment.student.name}</td>
                <td>{enrollment.student.last_name}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <Link
        href={`/api/download/${courseClassId}`}
        className="flex items-center justify-center bg-purple-800 text-sm rounded font-bold text-white h-10 hover:bg-purple-600"
      >
        Download
      </Link>
    </div>
  );
}
