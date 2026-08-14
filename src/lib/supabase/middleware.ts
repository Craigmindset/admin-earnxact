import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import type { Database } from "@/lib/database.types";

const PROTECTED_PREFIXES = ["/dashboard"];

/**
 * Refreshes the Supabase auth session on every request and redirects
 * unauthenticated/non-admin users away from protected routes. Called from
 * the root middleware.ts. Mirrors earnxact's src/lib/supabase/middleware.ts,
 * with one addition: admin-exact shares the same Supabase project as
 * earnxact, so a valid session alone isn't enough — the signed-in user must
 * also have user_profile.is_admin = true (see
 * earnxact/supabase/migrations/0012_admin_flag.sql), otherwise they're
 * signed out and bounced to /login.
 */
export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        }
      }
    }
  );

  // Do not add logic between createServerClient and getUser() — it can
  // cause hard-to-debug session refresh issues (per Supabase SSR guidance).
  const {
    data: { user }
  } = await supabase.auth.getUser();

  const isProtectedRoute = PROTECTED_PREFIXES.some((prefix) =>
    request.nextUrl.pathname.startsWith(prefix)
  );

  if (!isProtectedRoute) {
    return response;
  }

  if (!user) {
    const redirectUrl = new URL("/login", request.url);
    redirectUrl.searchParams.set("redirectTo", request.nextUrl.pathname);
    return NextResponse.redirect(redirectUrl);
  }

  const { data: profile } = await supabase
    .from("user_profile")
    .select("is_admin")
    .eq("user_id", user.id)
    .single();

  if (!profile?.is_admin) {
    await supabase.auth.signOut();
    const redirectUrl = new URL("/login", request.url);
    redirectUrl.searchParams.set("error", "not_authorized");
    const redirectResponse = NextResponse.redirect(redirectUrl);
    // Carry over the cleared session cookies from signOut() (written onto
    // `response` via the setAll callback above) so the browser actually
    // drops the invalid/unauthorized session instead of retrying it.
    response.cookies.getAll().forEach((cookie) => redirectResponse.cookies.set(cookie));
    return redirectResponse;
  }

  return response;
}
