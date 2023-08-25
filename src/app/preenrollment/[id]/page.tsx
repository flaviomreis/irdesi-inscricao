import Image from "next/image";
import { prisma } from "@/db/connection";

export default async function PreEnrollment({
  params,
}: {
  params: { id: string };
}) {
  console.log("id", params.id);

  const enrollment = await prisma.enrollment.findUnique({
    where: {
      id: params.id,
    },
    include: {
      course_class: {
        include: {
          institution: true,
          course: true,
        },
      },
      student: true,
    },
  });

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-2 break-words mx-auto px-4 max-w-lg">
      <Image
        src="/logo-v2.png"
        alt="Logo Campi-Irdesi"
        width={200}
        height={40}
        priority
      />

      {!enrollment ? (
        <p className="text-lg text-center text-orange-700">
          Matrícula não encontrada
        </p>
      ) : (
        <>
          <p className="text-lg text-center text-orange-700 w-full">
            Contrato: {enrollment.course_class.institution?.short_name}
          </p>
          <p className="text-base text-center w-full">
            Bem-vindo(a){" "}
            <span className="text-violet-800 ">
              {`${enrollment.student.name} ${enrollment.student.last_name}`}
            </span>
            !
          </p>
          <p className="text-base text-justify w-full">
            Sua pré-inscrição para o curso{" "}
            <span className="text-violet-800 ">
              {enrollment.course_class.course.name} (
              {enrollment.course_class.description})
            </span>{" "}
            foi enviada. Em breve ela será aprovada pelo administrador do curso
            e você receberá um email da plataforma Moodle com seu usuário e
            senha. O email poderá estar em sua caixa de SPAM, ele será
            semelhante ao email abaixo:
            <Image
              src={"/email.png"}
              alt="modelo de email enviado pela plataforma Moodle"
              width={621}
              height={621}
            />
          </p>
        </>
      )}
    </div>
  );
}
