"use client";

import { signIn } from "next-auth/react";

export default function LogonButton() {
  return (
    <div className="flex items-center justify-between w-full">
      Área de Administração
      <button
        onClick={() => signIn()}
        className="bg-purple-800 font-bold text-sm rounded text-white p-2 px-4 hover:bg-purple-600"
      >
        Entrar
      </button>
    </div>
  );
}
