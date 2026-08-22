"use client";

import Link from "next/link";
import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { MdAdminPanelSettings, MdVisibility, MdVisibilityOff } from "react-icons/md";
import { createClient } from "@/lib/supabase/client";

export default function AdminLoginPage() {
  return (
    <Suspense fallback={null}>
      <AdminLoginForm />
    </Suspense>
  );
}

function AdminLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(
    searchParams.get("error") === "not_authorized"
      ? "That account isn't authorized for admin access."
      : null
  );

  return (
    <section className="relative min-h-screen overflow-hidden bg-[var(--brand-black)]">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(1200px_circle_at_20%_20%,rgba(244,163,0,0.12),transparent_45%),radial-gradient(900px_circle_at_80%_10%,rgba(120,70,255,0.10),transparent_50%)]" />

      <div className="mx-auto flex min-h-screen max-w-6xl items-center justify-center px-4 py-10">
        <div className="w-full max-w-md rounded-2xl border border-white/10 bg-black/80 p-6 text-white shadow-[0_18px_60px_rgba(0,0,0,0.7)] backdrop-blur">
          <div className="flex items-center gap-2">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--brand-gold)]/15 text-[var(--brand-gold)]">
              <MdAdminPanelSettings className="text-xl" />
            </span>
            <span className="text-lg font-semibold tracking-wide">
              <span className="text-white">Earn</span>
              <span className="text-[var(--brand-gold)]">Xact</span>{" "}
              <span className="text-white/60">Admin</span>
            </span>
          </div>

          <div className="mt-5 text-xl font-semibold">Admin Login</div>
          <div className="mt-1 text-sm text-white/70">
            Sign in with your admin credentials to continue.
          </div>

          <form
            className="mt-6 space-y-4"
            onSubmit={async (event) => {
              event.preventDefault();
              if (isSubmitting) return;

              setErrorMessage(null);
              setIsSubmitting(true);

              const supabase = createClient();
              const { data, error } = await supabase.auth.signInWithPassword({
                email: email.trim(),
                password
              });

              if (error) {
                setIsSubmitting(false);
                setErrorMessage(error.message);
                return;
              }

              // Same Supabase project as earnxact - a valid login only
              // proves this is a real earnxact account, not that they're
              // staff. Check user_profile.is_admin before granting access,
              // and sign back out immediately if it's not set.
              const { data: profile, error: profileError } = await supabase
                .from("user_profile")
                .select("is_admin")
                .eq("user_id", data.user.id)
                .single();

              if (profileError || !profile?.is_admin) {
                await supabase.auth.signOut();
                setIsSubmitting(false);
                setErrorMessage("That account isn't authorized for admin access.");
                return;
              }

              const redirectTo = searchParams.get("redirectTo");
              router.push(redirectTo && redirectTo.startsWith("/") ? redirectTo : "/dashboard");
              router.refresh();
            }}
          >
            <div>
              <label className="mb-1 block text-sm text-white/80">Email</label>
              <input
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                type="email"
                required
                autoComplete="email"
                placeholder="admin@earnxact.com"
                className="w-full rounded-md border border-white/10 bg-black/60 px-3 py-2.5 text-sm text-white placeholder:text-white/40 outline-none focus:border-[var(--brand-gold)]"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm text-white/80">Password</label>
              <div className="relative">
                <input
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  type={showPassword ? "text" : "password"}
                  required
                  autoComplete="current-password"
                  placeholder="Enter password"
                  className="w-full rounded-md border border-white/10 bg-black/60 px-3 py-2.5 pr-10 text-sm text-white placeholder:text-white/40 outline-none focus:border-[var(--brand-gold)]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((value) => !value)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-white/80"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <MdVisibilityOff className="text-lg" />
                  ) : (
                    <MdVisibility className="text-lg" />
                  )}
                </button>
              </div>
            </div>

            {errorMessage ? (
              <p className="rounded-md border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-300">
                {errorMessage}
              </p>
            ) : null}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-md bg-[var(--brand-smoky-white)] px-4 py-2.5 text-sm font-semibold text-black transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? "Signing in..." : "Login"}
            </button>

            <div className="text-right text-sm">
              <Link
                href="/forgot-password"
                className="text-[var(--brand-gold)] hover:underline"
              >
                Forgot password?
              </Link>
            </div>
          </form>

          <p className="mt-5 text-center text-xs text-white/40">
            Restricted access. EarnXact staff only.
          </p>
        </div>
      </div>
    </section>
  );
}
