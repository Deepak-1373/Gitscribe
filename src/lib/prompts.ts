import { GoogleGenerativeAI } from "@google/generative-ai";
import type { GeneratePRResponse } from "@/types";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function buildPRDescription(
  diff: string,
  commitMessage?: string
): Promise<GeneratePRResponse> {
  const model = genAI.getGenerativeModel({ model: "gemini-3.1-pro-preview" });

  const prompt = buildPrompt(diff, commitMessage);
  const result = await model.generateContent(prompt);
  const text = result.response.text();

  return parseResponse(text);
}

function buildPrompt(diff: string, commitMessage?: string): string {
  return `You are a senior software engineer writing a pull request description for a code review.

Your goal is to produce a concise, professional PR description that helps reviewers quickly understand the intent, scope, and risk of the change. Write for an audience of experienced engineers — avoid filler phrases, passive voice, and obvious observations about the diff.

${commitMessage ? `COMMIT MESSAGE:\n${commitMessage}\n\n` : ""}GIT DIFF:
\`\`\`diff
${diff}
\`\`\`

Produce a JSON object with exactly these four string fields:

"summary"
  - 2–3 sentences maximum
  - State WHAT changed and WHY (the motivation or problem solved)
  - Use present tense, active voice ("Adds...", "Fixes...", "Replaces...")
  - Do not restate the diff line-by-line

"changes"
  - Bullet list of the meaningful code changes (use "- " prefix)
  - Group related changes; omit trivial ones (formatting, imports)
  - Each bullet should name the affected file, function, or module and describe the change in one clause
  - Maximum 8 bullets

"testing"
  - Bullet list of concrete steps a reviewer can follow to verify correctness (use "- " prefix)
  - Include specific commands, endpoints, or UI flows where relevant
  - If the diff includes automated tests, mention what they cover

"risks"
  - Bullet list of potential regressions, breaking changes, performance concerns, or security implications (use "- " prefix)
  - Be specific: name the affected system, user flow, or data path
  - If no meaningful risks exist, write exactly: "No significant risks identified."

Rules:
- Return only the raw JSON object — no markdown fences, no preamble, no trailing text
- All field values must be non-empty strings
- Do not invent details not present in the diff or commit message`;
}

function parseResponse(text: string): GeneratePRResponse {
  // Strip markdown code fences if the model wraps its output anyway
  const cleaned = text
    .trim()
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/, "")
    .trim();

  let parsed: Record<string, unknown>;
  try {
    parsed = JSON.parse(cleaned);
  } catch {
    throw new Error(`Gemini returned non-JSON output: ${cleaned.slice(0, 200)}`);
  }

  const get = (key: string): string => {
    const val = parsed[key];
    if (typeof val === "string" && val.trim().length > 0) return val.trim();
    throw new Error(`Missing or empty field in Gemini response: "${key}"`);
  };

  return {
    summary: get("summary"),
    changes: get("changes"),
    testing: get("testing"),
    risks: get("risks"),
  };
}
