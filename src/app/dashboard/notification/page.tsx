"use client";

import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { MdCheckCircle, MdErrorOutline, MdSend } from "react-icons/md";
import { createClient } from "@/lib/supabase/client";
import type { MembershipPlanRow } from "@/lib/database.types";

type TargetType = "all" | "plan" | "email";

type ResultModal = {
  type: "success" | "error";
  message: string;
};

export default function NotificationPage() {
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [targetType, setTargetType] = useState<TargetType>("all");
  const [membershipPlanId, setMembershipPlanId] = useState("");
  const [targetEmail, setTargetEmail] = useState("");

  const [plans, setPlans] = useState<MembershipPlanRow[]>([]);
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<ResultModal | null>(null);

  useEffect(() => {
    let cancelled = false;
    const supabase = createClient();

    async function loadPlans() {
      const { data } = await supabase
        .from("membership_plans")
        .select("id, name, amount, description, is_available, created_at")
        .order("amount", { ascending: true });
      if (!cancelled && data) setPlans(data);
    }

    loadPlans();
    return () => {
      cancelled = true;
    };
  }, []);

  async function handleSend(event: FormEvent) {
    event.preventDefault();
    if (sending) return;

    if (!title.trim() || !message.trim()) {
      setResult({ type: "error", message: "Please enter both a title and a message." });
      return;
    }

    if (targetType === "plan" && !membershipPlanId) {
      setResult({ type: "error", message: "Please select a membership plan to target." });
      return;
    }

    if (targetType === "email" && !targetEmail.trim()) {
      setResult({ type: "error", message: "Please enter the recipient's email address." });
      return;
    }

    setSending(true);

    const supabase = createClient();
    const { data, error } = await supabase.rpc("admin_send_notification", {
      p_title: title.trim(),
      p_message: message.trim(),
      p_target_type: targetType,
      p_membership_plan_id: targetType === "plan" ? membershipPlanId : null,
      p_target_email: targetType === "email" ? targetEmail.trim() : null
    });

    setSending(false);

    if (error) {
      setResult({ type: "error", message: error.message });
      return;
    }

    const recipients = data ?? 0;
    setResult({
      type: "success",
      message:
        recipients === 1
          ? "Notification sent to 1 user."
          : `Notification sent to ${recipients.toLocaleString()} users.`
    });
    setTitle("");
    setMessage("");
    setTargetEmail("");
    setMembershipPlanId("");
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white md:text-3xl">Notification</h1>
        <p className="mt-1 text-sm text-white/50">
          Send a message to all users, a specific membership plan, or a single user by email.
        </p>
      </div>

      <form
        onSubmit={handleSend}
        className="rounded-2xl border border-white/10 bg-white/5 p-5 md:p-6"
      >
        <div>
          <label className="text-xs font-medium text-white/60">Title</label>
          <input
            type="text"
            required
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="e.g. Scheduled maintenance"
            className="mt-1.5 w-full rounded-lg border border-white/10 bg-black/20 px-3 py-2.5 text-sm text-white outline-none focus:border-[var(--brand-gold)]"
          />
        </div>

        <div className="mt-4">
          <label className="text-xs font-medium text-white/60">Message</label>
          <textarea
            required
            rows={4}
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            placeholder="Write the message users will see..."
            className="mt-1.5 w-full resize-none rounded-lg border border-white/10 bg-black/20 px-3 py-2.5 text-sm text-white outline-none focus:border-[var(--brand-gold)]"
          />
        </div>

        <div className="mt-5">
          <span className="text-xs font-medium text-white/60">Send to</span>
          <div className="mt-2 flex flex-wrap gap-2">
            {(
              [
                { value: "all", label: "All users" },
                { value: "plan", label: "Membership plan" },
                { value: "email", label: "Specific user (email)" }
              ] as { value: TargetType; label: string }[]
            ).map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setTargetType(option.value)}
                className={`rounded-lg border px-3 py-2 text-xs font-semibold transition ${
                  targetType === option.value
                    ? "border-[var(--brand-gold)]/40 bg-[var(--brand-gold)]/15 text-[var(--brand-gold)]"
                    : "border-white/10 bg-black/20 text-white/60 hover:text-white"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {targetType === "plan" && (
          <div className="mt-4">
            <label className="text-xs font-medium text-white/60">Membership plan</label>
            <select
              required
              value={membershipPlanId}
              onChange={(event) => setMembershipPlanId(event.target.value)}
              className="mt-1.5 w-full rounded-lg border border-white/10 bg-black/20 px-3 py-2.5 text-sm text-white outline-none focus:border-[var(--brand-gold)]"
            >
              <option value="" disabled>
                Select a plan
              </option>
              {plans.map((plan) => (
                <option key={plan.id} value={plan.id}>
                  {plan.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {targetType === "email" && (
          <div className="mt-4">
            <label className="text-xs font-medium text-white/60">User email</label>
            <input
              type="email"
              required
              value={targetEmail}
              onChange={(event) => setTargetEmail(event.target.value)}
              placeholder="user@example.com"
              className="mt-1.5 w-full rounded-lg border border-white/10 bg-black/20 px-3 py-2.5 text-sm text-white outline-none focus:border-[var(--brand-gold)]"
            />
          </div>
        )}

        <button
          type="submit"
          disabled={sending}
          className="mt-6 inline-flex items-center gap-2 rounded-lg bg-[var(--brand-gold)] px-4 py-2.5 text-sm font-semibold text-black transition hover:opacity-90 disabled:opacity-60"
        >
          <MdSend className="text-base" />
          {sending ? "Sending..." : "Send Notification"}
        </button>
      </form>

      {result && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-[var(--brand-black)] p-6 text-center shadow-xl">
            {result.type === "success" ? (
              <MdCheckCircle className="mx-auto text-4xl text-emerald-400" />
            ) : (
              <MdErrorOutline className="mx-auto text-4xl text-red-400" />
            )}
            <h2 className="mt-3 text-base font-semibold text-white">
              {result.type === "success" ? "Sent successfully" : "Failed to send"}
            </h2>
            <p className="mt-1 text-sm text-white/60">{result.message}</p>
            <button
              type="button"
              onClick={() => setResult(null)}
              className="mt-5 w-full rounded-lg bg-[var(--brand-gold)] px-4 py-2.5 text-sm font-semibold text-black transition hover:opacity-90"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
