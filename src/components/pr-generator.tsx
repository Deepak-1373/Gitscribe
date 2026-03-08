"use client";

import { useState, useEffect, useCallback } from "react";
import type { GeneratePRResponse } from "@/types";

// ─── Toast ────────────────────────────────────────────────────────────────────

interface ToastProps {
  message: string;
  visible: boolean;
}

function Toast({ message, visible }: ToastProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={[
        "fixed bottom-6 left-1/2 -translate-x-1/2 z-50",
        "flex items-center gap-2.5 px-4 py-2.5",
        "bg-zinc-800 border border-zinc-700 rounded-lg shadow-xl",
        "text-xs font-mono text-zinc-100",
        "transition-all duration-200",
        visible
          ? "opacity-100 translate-y-0"
          : "opacity-0 translate-y-2 pointer-events-none",
      ].join(" ")}
    >
      <svg
        className="w-3.5 h-3.5 text-emerald-400 shrink-0"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2.5}
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
      </svg>
      {message}
    </div>
  );
}

function useToast(duration = 2000) {
  const [toast, setToast] = useState<{ message: string; visible: boolean }>({
    message: "",
    visible: false,
  });

  const show = useCallback(
    (message: string) => {
      setToast({ message, visible: true });
      setTimeout(
        () => setToast((t) => ({ ...t, visible: false })),
        duration
      );
    },
    [duration]
  );

  return { toast, show };
}

// ─── PRGenerator ──────────────────────────────────────────────────────────────

type Status = "idle" | "loading" | "success" | "error";

export function PRGenerator() {
  const [diff, setDiff] = useState("");
  const [commitMessage, setCommitMessage] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [result, setResult] = useState<GeneratePRResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [remaining, setRemaining] = useState<number | null>(null);
  const { toast, show: showToast } = useToast();

  const canSubmit = diff.trim().length > 0 && status !== "loading";

  async function handleGenerate() {
    setStatus("loading");
    setError(null);

    try {
      const res = await fetch("/api/generate-pr", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ diff, commitMessage: commitMessage || undefined }),
      });

      // Track remaining from response headers
      const rl = res.headers.get("X-RateLimit-Remaining");
      if (rl !== null) setRemaining(parseInt(rl, 10));

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? `Request failed (${res.status})`);
      }

      const data: GeneratePRResponse = await res.json();
      setResult(data);
      setStatus("success");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setStatus("error");
    }
  }

  function handleReset() {
    setDiff("");
    setCommitMessage("");
    setResult(null);
    setError(null);
    setStatus("idle");
  }

  return (
    <>
      <div className="flex flex-col gap-6">
        {/* Inputs */}
        <div className="flex flex-col gap-4">
          <Field
            label="git diff"
            hint={diff ? `${diff.split("\n").length} lines` : undefined}
          >
            <textarea
              value={diff}
              onChange={(e) => setDiff(e.target.value)}
              placeholder={DIFF_PLACEHOLDER}
              spellCheck={false}
              rows={12}
              className={textareaClass()}
            />
          </Field>

          <Field label="commit message" optional>
            <textarea
              value={commitMessage}
              onChange={(e) => setCommitMessage(e.target.value)}
              placeholder={"feat: add requireAuth middleware\nfix: handle missing session"}
              spellCheck={false}
              rows={3}
              className={textareaClass()}
            />
          </Field>
        </div>

        {/* Action row */}
        <div className="flex items-center justify-between">
          {status === "error" && error ? (
            <p className="text-xs text-red-400 font-mono">{error}</p>
          ) : (
            <div className="flex items-center gap-3">
              <span className="text-xs text-zinc-600 font-mono">
                {diff.length > 0
                  ? `${diff.length.toLocaleString()} chars`
                  : "Paste a diff to get started"}
              </span>
              {remaining !== null && (
                <span className={[
                  "text-xs font-mono",
                  remaining <= 3 ? "text-amber-400" : "text-zinc-600",
                ].join(" ")}>
                  {remaining}/{20} remaining today
                </span>
              )}
            </div>
          )}

          <div className="flex items-center gap-3">
            {(diff || commitMessage) && status !== "loading" && (
              <button
                onClick={handleReset}
                className="text-xs text-zinc-500 hover:text-zinc-300 font-mono transition-colors"
              >
                reset
              </button>
            )}
            <button
              onClick={handleGenerate}
              disabled={!canSubmit}
              className={[
                "flex items-center gap-2 px-4 py-2 rounded-md text-xs font-mono font-medium transition-all",
                "disabled:opacity-40 disabled:cursor-not-allowed",
                status === "loading"
                  ? "bg-emerald-800 text-emerald-300 cursor-wait"
                  : "bg-emerald-600 hover:bg-emerald-500 text-white",
              ].join(" ")}
            >
              {status === "loading" ? (
                <>
                  <Spinner />
                  generating…
                </>
              ) : (
                "Generate PR description →"
              )}
            </button>
          </div>
        </div>

        {/* Output */}
        {status === "loading" && <OutputSkeleton />}
        {status === "success" && result && (
          <Output result={result} onCopy={showToast} />
        )}
      </div>

      <Toast message={toast.message} visible={toast.visible} />
    </>
  );
}

// ─── Output ───────────────────────────────────────────────────────────────────

const SECTIONS: { key: keyof GeneratePRResponse; label: string }[] = [
  { key: "summary", label: "Summary" },
  { key: "changes", label: "Changes" },
  { key: "testing", label: "Testing" },
  { key: "risks",   label: "Risks"   },
];

function Output({
  result,
  onCopy,
}: {
  result: GeneratePRResponse;
  onCopy: (message: string) => void;
}) {
  const [justCopied, setJustCopied] = useState<string | null>(null);

  const allText = SECTIONS.map(
    ({ key, label }) => `## ${label}\n\n${result[key]}`
  ).join("\n\n");

  async function copy(text: string, key: string, toastMessage: string) {
    await navigator.clipboard.writeText(text);
    setJustCopied(key);
    setTimeout(() => setJustCopied(null), 2000);
    onCopy(toastMessage);
  }

  return (
    <div className="flex flex-col gap-4 border-t border-zinc-800 pt-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          <span className="text-xs font-mono font-semibold text-zinc-400 uppercase tracking-widest">
            Output
          </span>
        </div>

        {/* Primary copy button */}
        <button
          onClick={() => copy(allText, "all", "Full PR description copied")}
          className={[
            "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-mono font-medium transition-all",
            justCopied === "all"
              ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
              : "bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700",
          ].join(" ")}
        >
          {justCopied === "all" ? (
            <>
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
              Copied
            </>
          ) : (
            <>
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184" />
              </svg>
              Copy PR
            </>
          )}
        </button>
      </div>

      {/* Sections */}
      {SECTIONS.map(({ key, label }) => (
        <div key={key} className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-semibold text-zinc-400 uppercase tracking-widest">
              {label}
            </span>
            <button
              onClick={() => copy(result[key], key, `${label} copied`)}
              className="text-xs font-mono text-zinc-500 hover:text-zinc-200 transition-colors"
            >
              {justCopied === key ? "✓" : "copy"}
            </button>
          </div>
          <div className="bg-zinc-900 border border-zinc-700/80 rounded-lg px-4 py-3">
            <pre className="text-xs font-mono text-zinc-300 whitespace-pre-wrap leading-relaxed">
              {result[key]}
            </pre>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function OutputSkeleton() {
  return (
    <div className="flex flex-col gap-4 border-t border-zinc-800 pt-6 animate-pulse">
      <div className="flex items-center gap-2">
        <div className="w-1.5 h-1.5 rounded-full bg-zinc-700" />
        <div className="h-3 w-14 bg-zinc-800 rounded" />
      </div>
      {[48, 32, 40, 24].map((h, i) => (
        <div key={i} className="flex flex-col gap-1.5">
          <div className="h-3 w-16 bg-zinc-800 rounded" />
          <div
            className="bg-zinc-800/70 rounded-lg border border-zinc-700/40"
            style={{ height: `${h * 4}px` }}
          />
        </div>
      ))}
    </div>
  );
}

// ─── Primitives ───────────────────────────────────────────────────────────────

function Field({
  label,
  hint,
  optional,
  children,
}: {
  label: string;
  hint?: string;
  optional?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center gap-2">
        <label className="text-xs font-mono font-semibold text-zinc-400 uppercase tracking-widest">
          {label}
        </label>
        {optional && (
          <span className="text-xs font-mono text-zinc-600">optional</span>
        )}
        {hint && (
          <span className="ml-auto text-xs font-mono text-zinc-600 tabular-nums">
            {hint}
          </span>
        )}
      </div>
      {children}
    </div>
  );
}

function Spinner() {
  return (
    <span className="inline-block w-3 h-3 border border-emerald-400 border-t-transparent rounded-full animate-spin" />
  );
}

function textareaClass() {
  return [
    "w-full bg-zinc-900 text-zinc-100 font-mono text-xs leading-relaxed",
    "border border-zinc-700 rounded-lg px-4 py-3 resize-y",
    "focus:outline-none focus:ring-1 focus:ring-emerald-500/50 focus:border-emerald-500/50",
    "placeholder:text-zinc-600 transition-colors",
  ].join(" ");
}

const DIFF_PLACEHOLDER = `diff --git a/src/auth.ts b/src/auth.ts
index 1234567..abcdefg 100644
--- a/src/auth.ts
+++ b/src/auth.ts
@@ -10,6 +10,12 @@ export function getSession() {
   return session;
 }

+export function requireAuth(handler: Handler) {
+  return async (req: Request) => {
+    const session = await getSession();
+    if (!session) return new Response("Unauthorized", { status: 401 });
+    return handler(req, session);
+  };
+}`;
