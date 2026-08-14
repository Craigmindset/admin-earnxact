import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * Server-side logout: invalidates the session with Supabase Auth and clears
 * the auth cookies via the server client's cookie adapter (see
 * src/lib/supabase/server.ts). Called by the client-side logout helper
 * (src/lib/logout.ts) alongside a client-side signOut(), so the session is
 * torn down on both sides rather than relying on just one.
 */
export async function POST() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  return NextResponse.json({ success: true });
}
