import { prisma } from "@/db/connection";
import { Metadata } from "next";
import Link from "next/link";

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

export default async function AdminPage() {
  const institutions = await getInstitutions();

  return (
    <div className="flex flex-col gap-2">
      <h2>Contratos</h2>
      <ul className="list-disc pl-4 gap-2 flex flex-col">
        {institutions.map((institution) => {
          return (
            <li key={institution.id}>
              <Link href={`/admin/institution/${institution.id}`}>
                {institution.short_name}
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
