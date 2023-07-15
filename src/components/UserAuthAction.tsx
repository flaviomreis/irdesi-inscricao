"use client";

import { signIn, signOut, useSession } from "next-auth/react";

export default function UserAuthAction() {
  const { data, status } = useSession();
  return (
    <div className="flex justify-between items-center border-b border-gray-400">
      {status === "unauthenticated" ? (
        <div className="flex items-center justify-between w-full">
          <div>Área de Administração</div>
          <button
            onClick={() => signIn()}
            className="bg-purple-800 font-bold text-sm rounded text-white p-2 px-4 hover:bg-purple-600"
          >
            Entrar
          </button>
        </div>
      ) : (
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-2">
            Área do Administrador(a):
            <span className="text-purple-800">{data?.user?.name}</span>
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
