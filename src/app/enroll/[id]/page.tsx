import Image from "next/image";
import { prisma } from "@/db/connection";
import EnrollmentForm from "@/components/EnrollmentForm";

export default async function Enroll({ params }: { params: { id: string } }) {
  const courseClass = await prisma.courseClass.findUnique({
    where: {
      id: params.id,
    },
    include: {
      course: true,
      institution: true,
    },
  });
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-2 break-words mx-auto w-full max-w-xs">
      <Image
        src="/logo-v2.png"
        alt="Logo Campi-Irdesi"
        width={200}
        height={40}
        priority
      />

      <p className="text-lg text-center text-orange-700">
        ---=== Contrato: {courseClass?.institution?.short_name} ===---
      </p>
      <p className="text-base ">Pré-Inscrição para o Curso:</p>
      <p className="text-violet-800 text-base text-center">
        {courseClass?.course?.name}
      </p>
      <EnrollmentForm />
    </div>
  );
}
