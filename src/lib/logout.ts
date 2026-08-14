"use client";

import { createClient } from "@/lib/supabase/client";

/**
 * Logs out both server-side (revokes the session via a Route Handler using
 * the server Supabase client - src/app/api/auth/logout/route.ts) and
 * client-side (clears the browser session/cookies via supabase.auth.signOut()).
 * Best-effort: if the server call fails (e.g. network hiccup), the client
 * signOut() still runs so the user is never stuck signed in locally.
 */
export async function logout() {
  try {
    await fetch("/api/auth/logout", { method: "POST" });
  } catch {
    // Ignore - fall through to client-side signOut() regardless.
  }

  const supabase = createClient();
  await supabase.auth.signOut();
}
