import { z } from "zod";
import isValidCPF from "@/utils/cpf-validator";

const name = z.string().nonempty("O nome é obrigatório").trim();

const email = z
  .string()
  .nonempty("O email é obrigatório")
  .email("Este email é inválido")
  .toLowerCase()
  .trim();

const employeeId = z.string().trim().nonempty("A matrícula é obrigatória");

const cpf = z
  .string()
  .trim()
  .length(11, "O CPF precisa ter 11 dígitos")
  .refine((cpf) => !isNaN(+cpf), "O CPF precisa ser numérico")
  .refine((cpf) => isValidCPF(cpf), "O CPF precisa ser válido");

export const EnrollmentFormSchema = z.object({
  name,
  email,
  cpf,
});

export const EnrollmentWithEmployeeIdFormSchema = z.object({
  name,
  email,
  employeeId,
  cpf,
});
