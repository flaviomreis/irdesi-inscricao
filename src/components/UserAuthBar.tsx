import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getServerSession } from "next-auth";
import Image from "next/image";
import LogoffButton from "./LogoffButton";
import LogonButton from "./LogonButton";

type Props = {
  link: boolean;
};

export default async function UserAuthBar({ link }: Props) {
  const session = await getServerSession(authOptions);
  return (
    <div className="flex justify-between items-center border-b border-gray-400">
      {!session && <LogonButton />}

      {session && (
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-2">
            {link ? (
              <a href={"/admin"}>Área do Administrador(a):</a>
            ) : (
              "Administrador(a)"
            )}
            <span className="text-purple-800">{session.user?.name}</span>
            {session.user && session.user.image && session.user.name && (
              <Image
                src={session.user.image}
                width={32}
                height={32}
                alt={session.user.name}
                className="rounded-full"
              />
            )}
          </div>
          <LogoffButton />
        </div>
      )}
    </div>
  );
}
