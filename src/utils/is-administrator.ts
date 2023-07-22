import { prisma } from "@/db/connection";

export default async function isAdministrator(
  email: string | undefined | null
): Promise<boolean> {
  if (!email) return false;
  const administrator = await prisma.administrator.findUnique({
    where: {
      email,
    },
  });
  if (!administrator) return false;
  return true;
}
