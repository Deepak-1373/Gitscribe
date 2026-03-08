import { PRGenerator } from "@/components/pr-generator";

export default function DashboardPage() {
  return (
    <main className="flex-1 max-w-3xl w-full mx-auto px-6 py-8">
      {/* Page header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-1">
          <h1 className="text-xl font-bold tracking-tight text-zinc-50">
            PR Description Generator
          </h1>
          <span className="px-1.5 py-0.5 text-xs font-mono bg-zinc-800 text-zinc-400 rounded border border-zinc-700">
            v0.1
          </span>
        </div>
        <p className="text-sm text-zinc-400 font-mono">
          Paste a git diff + commit messages → get a ready-to-use PR description
        </p>
      </div>

      <PRGenerator />
    </main>
  );
}
