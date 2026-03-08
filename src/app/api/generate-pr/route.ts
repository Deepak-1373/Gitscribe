import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { buildPRDescription } from "@/lib/prompts";
import { checkRateLimit } from "@/lib/rateLimit";
import type { GeneratePRRequest } from "@/types";

export async function POST(req: NextRequest) {
  // 1. Auth guard
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 2. Rate limit (keyed by user email)
  const userEmail = session.user?.email;
  if (!userEmail) {
    return NextResponse.json(
      { error: "Session is missing email. Please sign out and sign back in." },
      { status: 400 }
    );
  }

  const { allowed, remaining, limit } = await checkRateLimit(userEmail);
  if (!allowed) {
    return NextResponse.json(
      {
        error: `Rate limit exceeded. You've used all ${limit} generations for today. Resets in 24 hours.`,
        code: "RATE_LIMIT_EXCEEDED",
      },
      {
        status: 429,
        headers: {
          "X-RateLimit-Limit": String(limit),
          "X-RateLimit-Remaining": "0",
          "Retry-After": "86400",
        },
      }
    );
  }

  // 3. Parse body
  let body: GeneratePRRequest;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  // 4. Validate
  if (!body.diff || typeof body.diff !== "string" || body.diff.trim().length === 0) {
    return NextResponse.json(
      { error: "Missing required field: diff" },
      { status: 400 }
    );
  }

  if (body.diff.length > 50_000) {
    return NextResponse.json(
      { error: "Input too large. Maximum 50,000 characters." },
      { status: 413 }
    );
  }

  // 5. Generate via Gemini
  try {
    const result = await buildPRDescription(body.diff, body.commitMessage);

    const response = NextResponse.json(result);
    response.headers.set("X-RateLimit-Limit", String(limit));
    response.headers.set("X-RateLimit-Remaining", String(remaining));
    return response;
  } catch (err) {
    console.error("[generate-pr] Gemini call failed:", err);
    return NextResponse.json(
      { error: "Failed to generate PR description. Please try again." },
      { status: 500 }
    );
  }
}
