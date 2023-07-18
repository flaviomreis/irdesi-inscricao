import Image from "next/image";
import EnrollmentForm from "@/components/EnrollmentForm";

async function getCourseClass(id: string) {
  const baseUrl = process.env.NEXT_PUBLIC_VERCEL_URL;
  const result = await fetch("/api/courseclasses?id=" + id, {
    cache: "no-store",
  });

  return result.json();
}

export default async function Enroll({ params }: { params: { id: string } }) {
  const courseClass = await getCourseClass(params.id);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-2 break-words mx-auto px-4 max-w-lg">
      <Image
        src="/logo-v2.png"
        alt="Logo Campi-Irdesi"
        width={200}
        height={40}
        priority
      />

      {!courseClass ? (
        <p className="text-lg text-center text-orange-700">
          Turma não encontrada
        </p>
      ) : (
        <>
          <p className="text-lg text-center text-orange-700 w-full">
            Contrato: {courseClass?.institution?.short_name}
          </p>
          <p className="text-base text-center w-full">
            Pré-Inscrição para o Curso
          </p>
          <p className="text-violet-800 text-base text-center w-full">
            {courseClass?.course?.name} ({courseClass?.description})
          </p>
          <EnrollmentForm requireEmployeeId={courseClass?.requireemployeeId} />
        </>
      )}
    </div>
  );
}
