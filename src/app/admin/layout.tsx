import UserAuthBar from "@/components/UserAuthBar";
import NextAuthProvider from "../providers/auth";
import { prisma } from "@/db/connection";
import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]/route";
import isAdministrator from "@/utils/is-administrator";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  return (
    <NextAuthProvider>
      <div className="container mx-auto p-4">
        <UserAuthBar />
        {(await isAdministrator(session?.user?.email))
          ? children
          : "Área restrita para administradores de pré-inscrição."}
      </div>
    </NextAuthProvider>
  );
}
