import { z } from "zod";
import isValidCPF from "@/utils/cpf-validator";

export const userEnrollmentFormSchema = z.object({
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
    .refine((cpf) => !isNaN(+cpf), "O CPF precisa ser numérico")
    .refine((cpf) => isValidCPF(cpf), "O CPF precisa ser válido"),
});
