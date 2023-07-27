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

  return (
    <div className="flex flex-col gap-2">
      <h2>Contrato: {courseClass?.institution.short_name}</h2>
      <h2>
        Turma: {courseClass?.course.short_name} ({courseClass?.description})
      </h2>
      <h2>Estudantes (10 primeiros)</h2>
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
                  <div className="flex items-center gap-2">
                    {enrollment.enrollment_status[0].enrollment_status_type
                      .name == "Sent" && (
                      <div className="h-2 w-2 rounded-full bg-yellow-200"></div>
                    )}
                    {enrollment.enrollment_status[0].enrollment_status_type
                      .name == "Confirmed" && (
                      <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                    )}
                    {enrollment.enrollment_status[0].enrollment_status_type
                      .name == "Active" && (
                      <div className="h-2 w-2 rounded-full bg-green-500"></div>
                    )}
                    {enrollment.enrollment_status[0].enrollment_status_type
                      .name == "Finished" && (
                      <div className="h-2 w-2 rounded-full bg-black"></div>
                    )}
                    <a href={`/admin/enrollment/${enrollment.id}`}>
                      {enrollment.student.cpf}
                    </a>
                  </div>
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
      <div className="flex items-center gap-2">
        Status da pré-inscrição:
        <div className="h-4 w-4 rounded-full bg-yellow-300"></div>
        <span>Enviado</span>
        <div className="h-4 w-4 rounded-full bg-blue-500"></div>
        <span>Confirmado</span>
        <div className="h-4 w-4 rounded-full bg-green-500"></div>
        <span>Ativo</span>
        <div className="h-4 w-4 rounded-full bg-black"></div>
        <span>Concluído</span>
      </div>
    </div>
  );
}
