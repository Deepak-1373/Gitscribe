// --- API contracts ---

export interface GeneratePRRequest {
  diff: string;
  commitMessage?: string;
}

export interface GeneratePRResponse {
  summary: string;
  changes: string;
  testing: string;
  risks: string;
}

// --- NextAuth type augmentation ---

import "next-auth";

declare module "next-auth" {
  interface Session {
    accessToken?: string;
    user: {
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    accessToken?: string;
  }
}
