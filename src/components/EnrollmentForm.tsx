"use client";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { EnrollmentFormSchema } from "@/schema/EnrollmentFormSchema";
import { useState } from "react";
import ConfirmDialog from "./ModalDialog";
import { useRouter } from "next/navigation";

type UserEnrollmentFormData = z.infer<typeof EnrollmentFormSchema>;

type Props = {
  courseClassId: string;
  method: "POST" | "PUT";
  action: string;
  student: UserEnrollmentFormData;
  studentId?: string;
};

export default function EnrollmentForm(props: Props) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<UserEnrollmentFormData>({
    resolver: zodResolver(EnrollmentFormSchema),
    defaultValues: props.student,
  });

  const [enrollmentError, setEnrollmentError] = useState<string>("");
  const [isDialogVisible, setIsDialogVisible] = useState<boolean>(false);
  const [confirmedRepeatedName, setConfirmedRepeatedName] = useState(false);
  const router = useRouter();

  async function handleConfirmAction() {
    const result = await fetch(`/api/enrollment/`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        courseClassId: props.courseClassId,
        studentId: props.studentId,
      }),
    });
    const json = await result.json();
    setEnrollmentError(json.error);
  }

  function checkRepeatedName(name: string, lastname: string) {
    const namepieces = name.split(" ");
    const lastnamepieces = lastname.split(" ");
    let repeated = false;
    namepieces.map((namepiece) => {
      lastnamepieces.map((lastnamepiece) => {
        if (lastnamepiece.toLowerCase() === namepiece.toLowerCase()) {
          repeated = true;
        }
      });
    });

    return repeated;
  }

  async function userEnrollment(data: UserEnrollmentFormData) {
    const repeteadName = checkRepeatedName(data.name, data.lastName);
    if (repeteadName && !confirmedRepeatedName) {
      setEnrollmentError(
        "Em seu nome há partes do sobrenome. Revise ou Envie novamente para confirmar"
      );
      setConfirmedRepeatedName(true);
      return;
    }

    const result = await fetch(props.action, {
      method: props.method,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        courseClassId: props.courseClassId,
        student: data,
        studentId: props.studentId,
      }),
    });

    const json = await result.json();
    if (result.status === 201) {
      return router.push(`/preenrollment/${json.enrollment_id}`);
    }
    setEnrollmentError(json.error);
  }

  return (
    <>
      <form
        onSubmit={handleSubmit(userEnrollment)}
        className="flex flex-col gap-4 w-full"
      >
        <div className="flex flex-col gap-1">
          <label htmlFor="name">Nome</label>
          <input
            type="text"
            placeholder="Ex. Maria"
            {...register("name")}
            className="border border-zinc-200 shadow-sm rounded h-10 px-3"
          />
          {errors.name && (
            <span className="text-xs text-red-500">{errors.name.message}</span>
          )}
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="lastName">Sobrenome</label>
          <input
            type="text"
            placeholder="Ex: Souza da Silva"
            {...register("lastName")}
            className="border border-zinc-200 shadow-sm rounded h-10 px-3"
          />
          {errors.lastName && (
            <span className="text-xs text-red-500">
              {errors.lastName.message}
            </span>
          )}
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="email">
            Email
            <span className="text-xs">
              (para envio da senha de acesso ao EaD)
            </span>
          </label>
          <input
            type="email"
            placeholder="seu@e.mail"
            {...register("email")}
            className="border border-zinc-200 shadow-sm rounded h-10 px-3"
          />
          {errors.email && (
            <span className="text-xs text-red-500">{errors.email.message}</span>
          )}
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="cpf">
            CPF <span className="text-xs">(somente os números)</span>
          </label>
          <input
            type="text"
            placeholder="99999999999"
            {...register("cpf")}
            className="border border-zinc-200 shadow-sm rounded h-10 px-3"
          />
          {errors.cpf && (
            <span className="text-xs text-red-500">{errors.cpf.message}</span>
          )}
        </div>

        {!!enrollmentError && (
          <div className="text-red-500">{enrollmentError}</div>
        )}

        <button
          disabled={isSubmitting}
          type="submit"
          className="bg-purple-800 text-sm rounded font-bold text-white h-10 hover:bg-purple-600"
        >
          {isSubmitting ? "Enviando" : "Enviar"}
        </button>
      </form>

      {props.method === "PUT" && (
        <div className="flex items-center justify-between mt-2">
          <a
            href={`/admin/courseclass/${props.courseClassId}`}
            className="flex items-center px-4 bg-purple-800 text-sm rounded font-bold text-white h-10 hover:bg-purple-600"
          >
            Voltar
          </a>
          <button
            type="button"
            onClick={() => setIsDialogVisible(true)}
            className="flex items-center px-4 bg-red-600 text-sm rounded font-bold text-white h-10 hover:bg-red-800"
          >
            Excluir
          </button>
        </div>
      )}

      <ConfirmDialog
        title="Atenção"
        question="Confirma a exclusão?"
        isVisible={isDialogVisible}
        closeDialog={() => setIsDialogVisible(false)}
        handleConfirmAction={() => handleConfirmAction()}
      />
    </>
  );
}
