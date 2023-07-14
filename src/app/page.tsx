"use client";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const userEnrollmentFormSchema = z.object({
  name: z
    .string()
    .nonempty("O nome é obrigatório")
    .transform((name) => {
      return name
        .trim()
        .split(" ")
        .map((word) => word[0].toLocaleUpperCase().concat(word.substring(1)))
        .join(" ");
    }),
  email: z
    .string()
    .nonempty("O email é obrigatório")
    .email("Este email é inválido")
    .toLowerCase()
    .trim(),
  cpf: z
    .string()
    .trim()
    .length(11, "O CPF precisa ter 11 dígitos")
    .refine((cpf) => !isNaN(+cpf), "O CPF precisa ser numérico"),
});

type UserEnrollmentFormData = z.infer<typeof userEnrollmentFormSchema>;

export default function Home() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<UserEnrollmentFormData>({
    resolver: zodResolver(userEnrollmentFormSchema),
  });

  function userEnrollment(data: any) {
    console.log(data);
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center">
      <div>
        <Image
          src="/logo-v2.png"
          alt="Logo Campi-Irdesi"
          width={200}
          height={40}
          priority
          className="mb-4"
        />
        <p className="font-bold text-xl mb-4">Pré-Inscrição para Curso EaD</p>
      </div>
      <form
        onSubmit={handleSubmit(userEnrollment)}
        className="flex flex-col gap-4 w-full max-w-xs"
      >
        <div className="flex flex-col gap-1">
          <label htmlFor="name">Nome</label>
          <input
            type="name"
            placeholder="Seu nome completo"
            {...register("name")}
            className="border border-zinc-200 shadow-sm rounded h-10 px-3"
          />
          {errors.name && (
            <span className="text-sm text-red-500">{errors.name.message}</span>
          )}
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="email">
            Email (para envio da senha de acesso ao EaD)
          </label>
          <input
            type="email"
            placeholder="seu@e.mail"
            {...register("email")}
            className="border border-zinc-200 shadow-sm rounded h-10 px-3"
          />
          {errors.email && (
            <span className="text-sm text-red-500">{errors.email.message}</span>
          )}
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="cpf">CPF (somente os números)</label>
          <input
            type="text"
            placeholder="99999999999"
            {...register("cpf")}
            className="border border-zinc-200 shadow-sm rounded h-10 px-3"
          />
          {errors.cpf && (
            <span className="text-sm text-red-500">{errors.cpf.message}</span>
          )}
        </div>

        <button
          type="submit"
          className="bg-purple-800 rounded font-semibold text-white h-10 hover:bg-purple-600"
        >
          Enviar
        </button>
      </form>
    </main>
  );
}
