"use client";

import { signOut } from "next-auth/react";

export function SignOutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: "/" })}
      className="text-xs text-zinc-400 hover:text-zinc-200 font-mono transition-colors"
    >
      sign out
    </button>
  );
}
