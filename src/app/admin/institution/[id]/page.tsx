import CopyToClipboardButton from "@/components/CopyToClipboardButton";
import { prisma } from "@/db/connection";
import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Irdesi - Administração de Pré-Inscrições",
};

async function getInstitution(id: string) {
  const result = await prisma.institution.findUnique({
    where: {
      id,
    },
    include: {
      course_class: {
        include: {
          course: true,
        },
      },
    },
  });
  return result;
}

export default async function AdminInstitutionPage({
  params,
}: {
  params: { id: string };
}) {
  const institutionId = params.id;
  const institution = await getInstitution(institutionId);

  return (
    <div className="flex flex-col gap-2">
      <h2>Contrato: {institution?.short_name}</h2>
      <h2>Turmas</h2>
      <ul className="list-disc pl-4 gap-2 flex flex-col">
        {institution?.course_class.map((courseClass) => {
          return (
            <li
              key={courseClass.id}
              className="flex item-center justify-between"
            >
              <Link
                href={`/admin/courseclass/${courseClass.id}`}
                className="flex items-center"
              >
                {courseClass.course.short_name} ({courseClass.description})
              </Link>
              <CopyToClipboardButton id={courseClass.id} />
            </li>
          );
        })}
      </ul>
    </div>
  );
}
