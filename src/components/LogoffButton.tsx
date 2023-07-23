"use client";

import { signOut } from "next-auth/react";

export default function LogoffButton() {
  return (
    <button
      onClick={() => signOut()}
      className="bg-purple-800 font-bold text-sm rounded text-white p-2 px-4 hover:bg-purple-600"
    >
      Sair
    </button>
  );
}
