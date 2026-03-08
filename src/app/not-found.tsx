import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center px-6 text-center">
      <p className="text-6xl font-bold text-zinc-700 font-mono mb-4">404</p>
      <h1 className="text-xl font-bold text-zinc-100 mb-2">Page not found</h1>
      <p className="text-sm text-zinc-400 font-mono mb-8">
        The page you&apos;re looking for doesn&apos;t exist.
      </p>
      <Link
        href="/"
        className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-100 text-xs font-mono font-medium rounded-md border border-zinc-700 transition-colors"
      >
        Back to home
      </Link>
    </div>
  );
}
