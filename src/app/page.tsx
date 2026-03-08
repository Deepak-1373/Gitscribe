import Link from "next/link";
import Image from "next/image";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import type { Session } from "next-auth";
import { SignOutButton } from "@/components/sign-out-button";

// ─── Data ─────────────────────────────────────────────────────────────────────

const FEATURES = [
  {
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z"
      />
    ),
    title: "Instant generation",
    description:
      "Paste a diff and get a structured PR description in under two seconds. No context switching, no blank page.",
  },
  {
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    ),
    title: "Structured output",
    description:
      "Every description includes Summary, Changes, Testing steps, and Risks — the four sections reviewers actually need.",
  },
  {
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5"
      />
    ),
    title: "Diff-aware",
    description:
      "GitScribe reads the actual changed lines. It names affected files and functions, not generic placeholders.",
  },
  {
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"
      />
    ),
    title: "Auth-gated API",
    description:
      "Every request is tied to a GitHub identity. No anonymous abuse, no shared rate limits.",
  },
  {
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184"
      />
    ),
    title: "One-click copy",
    description:
      "Copy individual sections or the entire description to clipboard. Paste straight into GitHub, Linear, or Jira.",
  },
  {
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z"
      />
    ),
    title: "Powered by Gemini",
    description:
      "Uses Google Gemini with a carefully engineered prompt that enforces professional, non-hallucinated output.",
  },
];

// const PRICING = [
//   {
//     name: "Free",
//     price: "$0",
//     period: "forever",
//     description: "For individual developers exploring the tool.",
//     features: [
//       "50 generations / month",
//       "Git diff + commit message input",
//       "4-section structured output",
//       "Clipboard copy",
//       "GitHub OAuth login",
//     ],
//     cta: "Get started",
//     href: "/auth/signin",
//     highlight: false,
//   },
//   {
//     name: "Pro",
//     price: "$9",
//     period: "per month",
//     description: "For engineers who ship pull requests every day.",
//     features: [
//       "Unlimited generations",
//       "Everything in Free",
//       "Priority Gemini model",
//       "API access",
//       "Email support",
//     ],
//     cta: "Start free trial",
//     href: "/auth/signin",
//     highlight: true,
//   },
//   {
//     name: "Team",
//     price: "$29",
//     period: "per seat / month",
//     description: "For engineering teams who want consistent PR quality.",
//     features: [
//       "Everything in Pro",
//       "Team dashboard",
//       "Usage analytics",
//       "SSO / SAML",
//       "Dedicated support",
//     ],
//     cta: "Contact us",
//     href: "/auth/signin",
//     highlight: false,
//   },
// ];

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function LandingPage() {
  const session = await getServerSession(authOptions);

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col">
      <Nav session={session} />

      <main className="flex-1">
        <Hero />
        <Features />
        <Demo />
        <Pricing />
        <CTA />
      </main>

      <Footer />
    </div>
  );
}

// ─── Nav ──────────────────────────────────────────────────────────────────────

function Nav({ session }: { session: Session | null }) {
  const isSignedIn = !!session?.user;

  return (
    <header className="sticky top-0 z-50 border-b border-zinc-800/80 bg-zinc-950/80 backdrop-blur-sm">
      <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <Logo />
            <span className="font-mono text-sm font-semibold text-zinc-100 tracking-tight">
              gitscribe
            </span>
          </Link>
          <span className="px-1.5 py-0.5 text-xs font-mono bg-zinc-800 text-zinc-400 rounded border border-zinc-700">
            beta
          </span>
        </div>

        <nav className="hidden sm:flex items-center gap-6">
          {["Features", "Demo", "Pricing"].map((label) => (
            <a
              key={label}
              href={`#${label.toLowerCase()}`}
              className="text-xs text-zinc-400 hover:text-zinc-100 font-mono transition-colors"
            >
              {label}
            </a>
          ))}
        </nav>

        {isSignedIn ? (
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="text-xs text-emerald-400 hover:text-emerald-300 font-mono transition-colors"
            >
              Dashboard
            </Link>
            <div className="w-px h-4 bg-zinc-700" />
            <div className="flex items-center gap-2">
              {session.user?.image && (
                <Image
                  src={session.user.image}
                  alt={session.user?.name ?? "User avatar"}
                  width={24}
                  height={24}
                  className="rounded-full ring-1 ring-zinc-700"
                />
              )}
              <span className="text-xs text-zinc-400 font-mono hidden sm:block">
                {session.user?.name ?? session.user?.email}
              </span>
            </div>
            <div className="w-px h-4 bg-zinc-700" />
            <SignOutButton />
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <Link
              href="/auth/signin"
              className="text-xs text-zinc-400 hover:text-zinc-100 font-mono transition-colors"
            >
              Sign in
            </Link>
            <Link
              href="/auth/signin"
              className="px-3 py-1.5 bg-zinc-100 hover:bg-white text-zinc-900 text-xs font-mono font-medium rounded-md transition-colors"
            >
              Get started
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}

// ─── Hero ─────────────────────────────────────────────────────────────────────

function Hero() {
  return (
    <section className="relative overflow-hidden px-6 pt-24 pb-20 flex flex-col items-center text-center">
      {/* Subtle radial glow */}
      <div
        className="pointer-events-none absolute inset-0 -top-40"
        aria-hidden
        style={{
          background:
            "radial-gradient(ellipse 80% 40% at 50% 0%, rgba(16,185,129,0.08) 0%, transparent 70%)",
        }}
      />

      {/* Badge */}
      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-emerald-500/25 bg-emerald-500/8 text-emerald-400 text-xs font-mono mb-8">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
        Now powered by Gemini 3
      </div>

      <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-zinc-50 max-w-3xl leading-[1.05] mb-6">
        AI that writes your{" "}
        <span
          className="bg-clip-text text-transparent"
          style={{
            backgroundImage:
              "linear-gradient(135deg, #34d399 0%, #059669 100%)",
          }}
        >
          pull requests
        </span>{" "}
        automatically.
      </h1>

      <p className="text-zinc-400 text-lg max-w-lg mb-10 leading-relaxed">
        Paste your git diff. Get a professional PR description with Summary,
        Changes, Testing steps, and Risks — in under two seconds.
      </p>

      <div className="flex items-center gap-4 flex-wrap justify-center">
        <Link
          href="/auth/signin"
          className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 text-sm font-mono font-semibold rounded-md transition-colors shadow-lg shadow-emerald-500/20"
        >
          Start for free →
        </Link>
        <a
          href="#demo"
          className="px-5 py-2.5 text-zinc-400 hover:text-zinc-100 text-sm font-mono transition-colors"
        >
          See it in action
        </a>
      </div>

      {/* Social proof */}
      <p className="mt-6 text-xs text-zinc-600 font-mono">
        No credit card required · GitHub OAuth · Cancel anytime
      </p>
    </section>
  );
}

// ─── Features ─────────────────────────────────────────────────────────────────

function Features() {
  return (
    <section id="features" className="px-6 py-24 border-t border-zinc-800">
      <div className="max-w-6xl mx-auto">
        <div className="max-w-xl mb-14">
          <p className="text-xs font-mono text-emerald-500 uppercase tracking-widest mb-3">
            Features
          </p>
          <h2 className="text-3xl font-bold tracking-tight text-zinc-50 leading-snug">
            Everything a good PR description needs.
          </h2>
          <p className="mt-3 text-zinc-400 text-sm leading-relaxed">
            GitScribe doesn&apos;t just summarise — it produces the structure senior
            engineers expect from every pull request.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {FEATURES.map(({ icon, title, description }) => (
            <div
              key={title}
              className="group flex flex-col gap-3 p-5 bg-zinc-900 border border-zinc-800 rounded-xl hover:border-zinc-700 transition-colors"
            >
              <div className="w-8 h-8 rounded-lg bg-zinc-800 group-hover:bg-zinc-700/80 border border-zinc-700 flex items-center justify-center transition-colors shrink-0">
                <svg
                  className="w-4 h-4 text-zinc-300"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                >
                  {icon}
                </svg>
              </div>
              <h3 className="text-sm font-semibold text-zinc-100">{title}</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">{description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Demo ─────────────────────────────────────────────────────────────────────

function Demo() {
  return (
    <section id="demo" className="px-6 py-24 border-t border-zinc-800">
      <div className="max-w-6xl mx-auto">
        <div className="max-w-xl mb-14">
          <p className="text-xs font-mono text-emerald-500 uppercase tracking-widest mb-3">
            Demo
          </p>
          <h2 className="text-3xl font-bold tracking-tight text-zinc-50 leading-snug">
            Diff in. Description out.
          </h2>
          <p className="mt-3 text-zinc-400 text-sm leading-relaxed">
            A real example — the diff adds authentication middleware, and
            GitScribe writes the full PR description automatically.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Input pane */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
            <div className="flex items-center gap-1.5 px-4 py-3 border-b border-zinc-800 bg-zinc-900">
              <div className="w-2.5 h-2.5 rounded-full bg-zinc-700" />
              <div className="w-2.5 h-2.5 rounded-full bg-zinc-700" />
              <div className="w-2.5 h-2.5 rounded-full bg-zinc-700" />
              <span className="ml-3 text-xs text-zinc-500 font-mono">
                Input — git diff HEAD
              </span>
            </div>
            <pre className="p-5 text-xs font-mono leading-relaxed overflow-x-auto text-zinc-400">
              <span className="text-zinc-600">{`diff --git a/src/middleware/auth.ts b/src/middleware/auth.ts\nnew file mode 100644\nindex 0000000..3fa2b1c\n--- /dev/null\n+++ b/src/middleware/auth.ts\n@@ -0,0 +1,18 @@\n`}</span>
              <span className="text-emerald-400">{`+import { getServerSession } from "next-auth";
+import { authOptions } from "@/lib/auth";
+import { NextResponse } from "next/server";
+import type { NextRequest } from "next/server";
+
+export async function requireAuth(
+  req: NextRequest,
+  handler: (req: NextRequest) => Promise<NextResponse>
+): Promise<NextResponse> {
+  const session = await getServerSession(authOptions);
+  if (!session) {
+    return NextResponse.json(
+      { error: "Unauthorized" },
+      { status: 401 }
+    );
+  }
+  return handler(req);
+}`}</span>
            </pre>
          </div>

          {/* Output pane */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800">
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span className="text-xs text-zinc-400 font-mono">
                  Generated PR description
                </span>
              </div>
              <span className="text-xs text-zinc-600 font-mono">1.4s</span>
            </div>
            <div className="p-5 flex flex-col gap-4">
              {[
                {
                  label: "Summary",
                  content:
                    "Introduces a requireAuth middleware that centralises authentication checks for API routes. Previously each handler called getServerSession directly; this extracts the pattern into a reusable utility and returns a consistent 401 response for unauthenticated requests.",
                },
                {
                  label: "Changes",
                  content:
                    "- src/middleware/auth.ts: new requireAuth wrapper function\n- Imports getServerSession and authOptions from existing auth config\n- Returns NextResponse.json 401 on missing session",
                },
                {
                  label: "Testing",
                  content:
                    "- Call a protected endpoint without a session cookie — expect 401\n- Call the same endpoint with a valid GitHub session — expect 200\n- Run existing auth integration tests: npm test src/middleware",
                },
                {
                  label: "Risks",
                  content:
                    "- Routes not yet migrated to requireAuth remain unprotected until updated\n- Behaviour depends on getServerSession; any authOptions change affects all guarded routes",
                },
              ].map(({ label, content }) => (
                <div key={label}>
                  <p className="text-xs font-mono font-semibold text-zinc-400 uppercase tracking-widest mb-1.5">
                    {label}
                  </p>
                  <p className="text-xs font-mono text-zinc-300 leading-relaxed whitespace-pre-line">
                    {content}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Pricing ──────────────────────────────────────────────────────────────────

function Pricing() {
  return (
    <section id="pricing" className="px-6 py-24 border-t border-zinc-800">
      <div className="max-w-6xl mx-auto">
        <div className="max-w-xl mb-14">
          <p className="text-xs font-mono text-emerald-500 uppercase tracking-widest mb-3">
            Pricing
          </p>
          <h2 className="text-3xl font-bold tracking-tight text-zinc-50 leading-snug">
            Simple, transparent pricing.
          </h2>
          <p className="mt-3 text-zinc-400 text-sm leading-relaxed">
            We&apos;re currently in beta. All features are free while we refine the experience.
          </p>
        </div>

        <div className="flex flex-col items-center justify-center py-16 px-6 bg-zinc-900 border border-zinc-800 rounded-xl">
          <div className="flex items-center gap-2 mb-4">
            <span className="px-2 py-0.5 text-xs font-mono bg-emerald-500/15 text-emerald-400 border border-emerald-500/25 rounded-full">
              Beta
            </span>
            <span className="px-2 py-0.5 text-xs font-mono bg-zinc-800 text-zinc-400 border border-zinc-700 rounded-full">
              Free
            </span>
          </div>
          <h3 className="text-2xl font-bold text-zinc-50 mb-2">Coming soon</h3>
          <p className="text-sm text-zinc-400 font-mono text-center max-w-md leading-relaxed mb-6">
            Pricing plans are being finalized. During the beta, enjoy 20 free
            generations per day with full access to all features.
          </p>
          <Link
            href="/auth/signin"
            className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 text-sm font-mono font-semibold rounded-md transition-colors"
          >
            Try it free →
          </Link>
        </div>
      </div>
    </section>
  );
}

// ─── CTA ──────────────────────────────────────────────────────────────────────

function CTA() {
  return (
    <section className="px-6 py-24 border-t border-zinc-800">
      <div className="max-w-2xl mx-auto text-center">
        <h2 className="text-4xl font-bold tracking-tight text-zinc-50 leading-tight mb-4">
          Stop writing PR descriptions manually.
        </h2>
        <p className="text-zinc-400 text-base leading-relaxed mb-10">
          GitScribe handles the boilerplate so you can focus on the code.
          Connect your GitHub account and generate your first description in
          30 seconds.
        </p>
        <Link
          href="/auth/signin"
          className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 text-sm font-mono font-semibold rounded-md transition-colors shadow-xl shadow-emerald-500/20"
        >
          <svg
            className="w-4 h-4"
            fill="currentColor"
            viewBox="0 0 20 20"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M10 0C4.477 0 0 4.484 0 10.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0110 4.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0020 10.017C20 4.484 15.522 0 10 0z"
              clipRule="evenodd"
            />
          </svg>
          Continue with GitHub — it&apos;s free
        </Link>
        <p className="mt-4 text-xs text-zinc-600 font-mono">
          No credit card · GitHub OAuth · Cancel anytime
        </p>
      </div>
    </section>
  );
}

// ─── Footer ───────────────────────────────────────────────────────────────────

function Footer() {
  return (
    <footer className="border-t border-zinc-800 px-6 py-10">
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Logo />
          <span className="text-sm font-mono font-semibold text-zinc-400">gitscribe</span>
        </div>

        <div className="flex items-center gap-6">
          {["Features", "Demo", "Pricing"].map((label) => (
            <a
              key={label}
              href={`#${label.toLowerCase()}`}
              className="text-xs text-zinc-600 hover:text-zinc-400 font-mono transition-colors"
            >
              {label}
            </a>
          ))}
        </div>

        <p className="text-xs text-zinc-600 font-mono">
          Built with Next.js · Gemini · NextAuth
        </p>
      </div>
    </footer>
  );
}

// ─── Logo ─────────────────────────────────────────────────────────────────────

function Logo() {
  return (
    <div className="w-6 h-6 rounded bg-emerald-500 flex items-center justify-center shrink-0">
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
  );
}
