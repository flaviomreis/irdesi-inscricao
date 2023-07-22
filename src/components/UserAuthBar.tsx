"use client";

import { signIn, signOut, useSession } from "next-auth/react";

export default function UserAuthBar() {
  const { data, status } = useSession();
  return (
    <div className="flex justify-between items-center border-b border-gray-400">
      {status === "unauthenticated" && (
        <div className="flex items-center justify-between w-full">
          Área de Administração
          <button
            onClick={() => signIn()}
            className="bg-purple-800 font-bold text-sm rounded text-white p-2 px-4 hover:bg-purple-600"
          >
            Entrar
          </button>
        </div>
      )}

      {status === "loading" && (
        <div className="flex items-center h-10 text-purple-800">
          Obtendo informações do(a) usuário(a)
        </div>
      )}

      {status === "authenticated" && (
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-2">
            <a href={"/admin"}>Área do Administrador(a):</a>
            <span className="text-purple-800">{data?.user?.name}</span>
            <img
              src={data?.user?.image ?? ""}
              width={32}
              alt="{data?.user?.name}"
              className="rounded-full"
            />
          </div>
          <button
            onClick={() => signOut()}
            className="bg-purple-800 font-bold text-sm rounded text-white p-2 px-4 hover:bg-purple-600"
          >
            Sair
          </button>
        </div>
      )}
    </div>
  );
}
