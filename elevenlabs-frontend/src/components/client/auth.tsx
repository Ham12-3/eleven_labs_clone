"use client";

import { signOut } from "next-auth/react";

export function SignOut() {
  return (
    <button
      onClick={() => signOut()}
      className="text-sm font-medium text-gray-500 hover:text-gray-700"
    >
      Sign Out
    </button>
  );
} 