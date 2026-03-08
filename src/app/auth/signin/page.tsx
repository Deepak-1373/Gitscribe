import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { authOptions } from "@/lib/auth";

export default async function SignInPage() {
  const session = await getServerSession(authOptions);

  if (session) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Card */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-8 shadow-xl">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-8">
            <div className="w-8 h-8 rounded bg-emerald-500 flex items-center justify-center">
              <svg
                className="w-4 h-4 text-zinc-950"
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
            <div>
              <p className="text-sm font-semibold text-zinc-100 font-mono">
                gitscribe
              </p>
              <p className="text-xs text-zinc-500 font-mono">
                AI PR generator
              </p>
            </div>
          </div>

          <h1 className="text-lg font-bold text-zinc-100 mb-1">
            Sign in to continue
          </h1>
          <p className="text-xs text-zinc-400 font-mono mb-6">
            Authenticate with your GitHub account to start generating PR
            descriptions.
          </p>

          {/* GitHub OAuth Button */}
          <GitHubSignInButton />

          <p className="text-xs text-zinc-600 text-center mt-6 font-mono leading-relaxed">
            By signing in you agree to only use this service for legitimate
            development purposes.
          </p>
        </div>

        {/* Back link */}
        <div className="text-center mt-4">
          <Link
            href="/"
            className="text-xs text-zinc-500 hover:text-zinc-300 font-mono transition-colors"
          >
            ← Back to home
          </Link>
        </div>
      </div>
    </div>
  );
}

// Client component inline to avoid extra file for a single button
import { GitHubSignInButton } from "@/components/github-sign-in-button";
