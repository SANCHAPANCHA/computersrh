import type { EmailOtpType } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";
import { createSupabaseServer } from "@/lib/supabase/server";
import { safeNext } from "@/lib/utils";

/** Handles email verification, magic and password-reset links. */
export async function GET(req: NextRequest) {
  const url = req.nextUrl;
  const next = safeNext(url.searchParams.get("next"), "/dashboard");
  const code = url.searchParams.get("code");
  const tokenHash = url.searchParams.get("token_hash");
  const type = url.searchParams.get("type") as EmailOtpType | null;
  const sb = await createSupabaseServer();

  if (sb) {
    const { error } = code
      ? await sb.auth.exchangeCodeForSession(code)
      : tokenHash && type
        ? await sb.auth.verifyOtp({ type, token_hash: tokenHash })
        : { error: new Error("missing token") };
    if (!error) return NextResponse.redirect(new URL(next, url.origin));
  }
  return NextResponse.redirect(new URL("/login?error=link", url.origin));
}
