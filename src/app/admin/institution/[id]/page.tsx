import CopyToClipboardButton from "@/components/CopyToClipboardButton";
import { prisma } from "@/db/connection";
import { Metadata } from "next";

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
              <a href={`/admin/courseclass/${courseClass.id}`}>
                {courseClass.course.short_name} ({courseClass.description})
              </a>
              <div className="flex gap-2">
                <CopyToClipboardButton
                  id={courseClass.id}
                  title="URL Formulário"
                  endpoint="enroll"
                />
                <CopyToClipboardButton
                  id={courseClass.id}
                  title="URL Relatório"
                  endpoint="enrollmentreport"
                />
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
