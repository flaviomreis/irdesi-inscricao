import { prisma } from "@/db/connection";
import Link from "next/link";

async function getEnrollment(id: string) {
  const result = await prisma.enrollment.findUnique({
    where: {
      id,
    },
    include: {
      student: true,
      course_class: true,
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

  return (
    <div>
      <h1>1</h1>
      <div className="flex items-center justify-between">
        <Link
          href={`/admin/courseclass/${enrollment?.course_class.id}`}
          className="flex items-center px-4 bg-purple-800 text-sm rounded font-bold text-white h-10 hover:bg-purple-600"
        >
          Cancelar
        </Link>
        <Link
          href={`/admin/courseclass/${enrollment?.course_class.id}`}
          className="flex items-center px-4 bg-purple-800 text-sm rounded font-bold text-white h-10 hover:bg-purple-600"
        >
          Atualizar
        </Link>
        <Link
          href={`/admin/courseclass/${enrollment?.course_class.id}`}
          className="flex items-center px-4 bg-red-600 text-sm rounded font-bold text-white h-10 hover:bg-red-800"
        >
          Excluir
        </Link>
      </div>
    </div>
  );
}
