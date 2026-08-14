import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Production admin domain the invite email's link should always send the
// invited admin to, regardless of what host/port this API route happens to
// be running on (e.g. localhost during local development). Override via
// NEXT_PUBLIC_ADMIN_SITE_URL if the production domain ever changes.
const ADMIN_SITE_URL = (process.env.NEXT_PUBLIC_ADMIN_SITE_URL || "https://admin.earnxact.com").replace(/\/+$/, "");

export async function POST(request: NextRequest) {
  try {
    const { firstName, lastName, email } = await request.json();
    const normalizedEmail = String(email ?? "").trim().toLowerCase();
    const normalizedFirstName = String(firstName ?? "").trim();
    const normalizedLastName = String(lastName ?? "").trim();

    if (!normalizedEmail || !normalizedFirstName || !normalizedLastName) {
      return NextResponse.json(
        { error: "First name, last name, and email are required." },
        { status: 400 }
      );
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json(
        { error: "Missing Supabase service-role configuration." },
        { status: 500 }
      );
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false
      }
    });

    const { data, error } = await supabase.auth.admin.inviteUserByEmail(normalizedEmail, {
      redirectTo: `${ADMIN_SITE_URL}/login`,
      data: {
        first_name: normalizedFirstName,
        last_name: normalizedLastName,
        is_admin: true
      }
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, user: data?.user ?? null });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to send admin invite.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
