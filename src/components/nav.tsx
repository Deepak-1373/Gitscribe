import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import Image from "next/image";
import Link from "next/link";
import { SignOutButton } from "@/components/sign-out-button";

export async function Nav() {
  const session = await getServerSession(authOptions);

  return (
    <header className="border-b border-zinc-800 bg-zinc-950">
      <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
          <div className="w-6 h-6 rounded bg-emerald-500 flex items-center justify-center">
            <svg
              className="w-3.5 h-3.5 text-zinc-950"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 3v12M6 3l6 6M6 3L.5 8.5M18 21V9m0 12l6-5.5M18 21l-6-5.5"
              />
            </svg>
          </div>
          <span className="font-mono text-sm font-semibold text-zinc-100 tracking-tight">
            gitscribe
          </span>
          <span className="px-1.5 py-0.5 text-xs font-mono bg-zinc-800 text-zinc-400 rounded border border-zinc-700">
            beta
          </span>
        </Link>

        {session?.user && (
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              {session.user.image && (
                <Image
                  src={session.user.image}
                  alt={session.user.name ?? "User avatar"}
                  width={24}
                  height={24}
                  className="rounded-full ring-1 ring-zinc-700"
                />
              )}
              <span className="text-xs text-zinc-400 font-mono hidden sm:block">
                {session.user.name ?? session.user.email}
              </span>
            </div>
            <div className="w-px h-4 bg-zinc-700" />
            <SignOutButton />
          </div>
        )}
      </div>
    </header>
  );
}
