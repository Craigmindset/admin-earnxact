"use client";

import Link from "next/link";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

const ADMIN_SITE_URL =
  process.env.NEXT_PUBLIC_ADMIN_SITE_URL?.replace(/\/+$/, "") ?? "";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  return (
    <section className="relative min-h-screen overflow-hidden bg-[var(--brand-black)]">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(1200px_circle_at_20%_20%,rgba(244,163,0,0.12),transparent_45%),radial-gradient(900px_circle_at_80%_10%,rgba(120,70,255,0.10),transparent_50%)]" />

      <div className="mx-auto flex min-h-screen max-w-6xl items-center justify-center px-4 py-10">
        <div className="w-full max-w-md rounded-2xl border border-white/10 bg-black/80 p-6 text-white shadow-[0_18px_60px_rgba(0,0,0,0.7)] backdrop-blur">
          <div className="text-xl font-semibold">Forgot password</div>
          <div className="mt-1 text-sm text-white/70">
            Enter your admin email and we&apos;ll send you a link to reset your
            password.
          </div>

          {sent ? (
            <div className="mt-6 rounded-lg border border-[var(--brand-gold)]/30 bg-[var(--brand-gold)]/10 px-3 py-3 text-sm text-white/80">
              A password reset link has been sent to <span className="font-semibold">{email}</span>.
            </div>
          ) : (
            <form
              className="mt-6 space-y-4"
              onSubmit={async (event) => {
                event.preventDefault();
                if (isSubmitting) return;

                const normalizedEmail = email.trim().toLowerCase();
                if (!normalizedEmail) return;

                setErrorMessage(null);
                setIsSubmitting(true);

                try {
                  const checkResponse = await fetch("/api/auth/check-email", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ email: normalizedEmail })
                  });

                  const checkPayload = await checkResponse.json().catch(() => null);

                  if (!checkResponse.ok) {
                    setErrorMessage(checkPayload?.error || "Unable to verify email right now");
                    setIsSubmitting(false);
                    return;
                  }

                  if (!checkPayload?.exists) {
                    setErrorMessage("email not found");
                    setIsSubmitting(false);
                    return;
                  }

                  const supabase = createClient();
                  const redirectBase =
                    ADMIN_SITE_URL ||
                    (typeof window !== "undefined" ? window.location.origin : "");
                  const { error } = await supabase.auth.resetPasswordForEmail(
                    normalizedEmail,
                    {
                      redirectTo: redirectBase
                        ? `${redirectBase}/reset-password`
                        : undefined
                    }
                  );

                  setIsSubmitting(false);

                  if (error) {
                    setErrorMessage(error.message);
                    return;
                  }

                  setEmail(normalizedEmail);
                  setSent(true);
                } catch (error) {
                  setIsSubmitting(false);
                  setErrorMessage(
                    error instanceof Error
                      ? error.message
                      : "Unable to send reset link right now"
                  );
                }
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

              {errorMessage ? (
                <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">
                  {errorMessage}
                </div>
              ) : null}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full rounded-md bg-[var(--brand-gold)] px-4 py-2.5 text-sm font-semibold text-black hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmitting ? "Sending link..." : "Send reset link"}
              </button>
            </form>
          )}

          <div className="mt-4 text-sm text-white/70">
            Remembered your password?{" "}
            <Link
              href="/login"
              className="font-semibold text-[var(--brand-gold)] hover:underline"
            >
              Back to login
            </Link>
            .
          </div>
        </div>
      </div>
    </section>
  );
}