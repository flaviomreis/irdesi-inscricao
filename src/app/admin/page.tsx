import { prisma } from "@/db/connection";
import plural from "@/utils/plural";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Irdesi - Administração de Pré-Inscrições",
};

async function getInstitutions() {
  const result = await prisma.institution.findMany({
    orderBy: [
      {
        short_name: "asc",
      },
    ],
  });
  return result;
}

async function groupByInstitutions() {
  const result = await prisma.institution.findMany({
    select: {
      id: true,
      name: true,
      short_name: true,
      course_class: {
        select: {
          _count: {
            select: {
              enrollment: {
                where: {
                  confirmed_at: null,
                },
              },
            },
          },
        },
      },
    },
    orderBy: {
      short_name: "asc",
    },
  });

  return result;
}

export default async function AdminPage() {
  // const institutions = await getInstitutions();
  const institutions = await groupByInstitutions();

  return (
    <div className="flex flex-col gap-2">
      <h2>Contratos</h2>
      <ul className="list-disc pl-4 gap-2 flex flex-col">
        {institutions.map((institution) => {
          return (
            <li key={institution.id}>
              <a href={`/admin/institution/${institution.id}`}>
                {institution.short_name}
              </a>
              {institution.course_class[0]._count.enrollment > 0 && (
                <span className="text-orange-500">
                  {" "}
                  :{" "}
                  {plural(
                    "inscrição",
                    institution.course_class[0]._count.enrollment
                  )}{" "}
                  para Confirmar
                </span>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
