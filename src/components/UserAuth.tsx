"use client";

import { signIn, signOut, useSession } from "next-auth/react";

export default function UserAuth() {
  const { data } = useSession();
  return (
    <div className="flex justify-between items-center border-b border-gray-400">
      <h1>Área do Administrador</h1>
      {data && data.user ? (
        <button
          onClick={() => signOut()}
          className="bg-purple-800 font-bold text-sm rounded text-white p-2 px-4 hover:bg-purple-600"
        >
          <div className="flex items-center gap-2">
            <img src={data.user.image ?? ""} width={24} />
            {data.user.name}
          </div>
        </button>
      ) : (
        <button
          onClick={() => signIn()}
          className="bg-purple-800 font-bold text-sm rounded text-white p-2 px-4 hover:bg-purple-600"
        >
          <span>Sign In</span>
        </button>
      )}
    </div>
  );
}
