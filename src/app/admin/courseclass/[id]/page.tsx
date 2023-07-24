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
                  <a href={`/admin/enrollment/${enrollment.id}`}>
                    {enrollment.student.cpf}
                  </a>
                </td>
                <td>{enrollment.student.email}</td>
                <td>{enrollment.student.name}</td>
                <td>{enrollment.student.last_name}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <DownloadButton courseClassId={courseClassId} />
    </div>
  );
}
