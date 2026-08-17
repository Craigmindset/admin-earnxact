"use client";

import { useEffect, useMemo, useState } from "react";
import type { IconType } from "react-icons";
import {
  MdBusinessCenter,
  MdCheckCircle,
  MdEmojiEvents,
  MdGroups,
  MdLocationOff,
  MdMilitaryTech,
  MdRefresh,
  MdRocketLaunch,
  MdSupervisorAccount,
  MdWorkspacePremium
} from "react-icons/md";
import { CURRENCY_SYMBOL } from "@/lib/currency";
import type { MembershipPlanRow } from "@/lib/database.types";
import { createClient } from "@/lib/supabase/client";

const PLAN_ICON_BY_NAME = new Map<string, IconType>([
  ["free", MdGroups],
  ["task class1", MdGroups],
  ["task class2", MdRocketLaunch],
  ["upscale class", MdRocketLaunch],
  ["supervisor class", MdMilitaryTech],
  ["junior manager", MdSupervisorAccount],
  ["mid executive", MdBusinessCenter],
  ["excecutive", MdWorkspacePremium],
  ["senior executive", MdEmojiEvents],
  ["regional manager", MdLocationOff]
]);

function iconForPlan(name: string) {
  return PLAN_ICON_BY_NAME.get(name.trim().toLowerCase()) ?? MdWorkspacePremium;
}

function formatAmount(amount: number) {
  return `${CURRENCY_SYMBOL}${amount.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })}`;
}

export default function EarnPassPage() {
  const [plans, setPlans] = useState<MembershipPlanRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [savingPlanId, setSavingPlanId] = useState<string | null>(null);

  async function loadPlans() {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("membership_plans")
      .select("id, name, amount, description, is_available, created_at")
      .order("amount", { ascending: true });

    if (error) {
      setErrorMessage(error.message);
      setLoading(false);
      return;
    }

    setPlans((data ?? []) as MembershipPlanRow[]);
    setErrorMessage(null);
    setLoading(false);
  }

  useEffect(() => {
    loadPlans();
  }, []);

  async function toggleAvailability(plan: MembershipPlanRow) {
    if (savingPlanId) return;

    setSavingPlanId(plan.id);
    setErrorMessage(null);

    const nextAvailability = !plan.is_available;
    const supabase = createClient();
    const { error } = await supabase.rpc("admin_set_membership_plan_availability", {
      p_plan_id: plan.id,
      p_is_available: nextAvailability
    });

    if (error) {
      setErrorMessage(error.message);
      setSavingPlanId(null);
      return;
    }

    setPlans((current) =>
      current.map((currentPlan) =>
        currentPlan.id === plan.id
          ? { ...currentPlan, is_available: nextAvailability }
          : currentPlan
      )
    );
    setSavingPlanId(null);
  }

  const summary = useMemo(() => {
    const availableCount = plans.filter((plan) => plan.is_available).length;
    const unavailableCount = plans.length - availableCount;

    return {
      total: plans.length,
      availableCount,
      unavailableCount
    };
  }, [plans]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white md:text-3xl">Earn Pass</h1>
          <p className="mt-1 text-sm text-white/50">
            Manage the membership plans in <span className="font-medium text-white/70">public.membership_plans</span> and control whether each plan is available to users.
          </p>
        </div>

        <button
          type="button"
          onClick={loadPlans}
          className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-semibold text-white/80 transition hover:bg-white/10"
        >
          <MdRefresh className="text-base" />
          Refresh
        </button>
      </div>

      {errorMessage ? (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {errorMessage}
        </div>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <div className="text-xs font-semibold uppercase tracking-wide text-white/50">Total plans</div>
          <div className="mt-2 text-3xl font-semibold text-white">{summary.total}</div>
        </div>
        <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-5">
          <div className="text-xs font-semibold uppercase tracking-wide text-emerald-300">Available</div>
          <div className="mt-2 text-3xl font-semibold text-white">{summary.availableCount}</div>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <div className="text-xs font-semibold uppercase tracking-wide text-white/50">Unavailable</div>
          <div className="mt-2 text-3xl font-semibold text-white">{summary.unavailableCount}</div>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={index}
              className="h-64 animate-pulse rounded-2xl border border-white/10 bg-white/5"
            />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {plans.map((plan) => {
            const Icon = iconForPlan(plan.name);
            const isSaving = savingPlanId === plan.id;

            return (
              <div
                key={plan.id}
                className={`flex min-h-[18rem] flex-col rounded-2xl border p-5 ${
                  plan.is_available
                    ? "border-[var(--brand-gold)]/25 bg-[var(--brand-gold)]/5"
                    : "border-white/10 bg-white/5"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[var(--brand-gold)]/15 text-[var(--brand-gold)]">
                      <Icon className="text-xl" />
                    </span>
                    <div className="min-w-0">
                      <div className="truncate text-sm font-semibold text-white">{plan.name}</div>
                      <div className="text-xs text-white/50">{formatAmount(Number(plan.amount))}</div>
                    </div>
                  </div>

                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                      plan.is_available
                        ? "bg-emerald-500/15 text-emerald-300"
                        : "bg-white/10 text-white/60"
                    }`}
                  >
                    <MdCheckCircle className="text-sm" />
                    {plan.is_available ? "Available" : "Unavailable"}
                  </span>
                </div>

                <p className="mt-4 flex-1 text-sm leading-relaxed text-white/65">
                  {plan.description?.trim() || "No description added for this membership plan yet."}
                </p>

                <div className="mt-4 flex items-center justify-between gap-3 border-t border-white/10 pt-4 text-xs text-white/45">
                  <span>Created {new Date(plan.created_at).toLocaleDateString()}</span>
                  <span>ID: {plan.id.slice(0, 8)}...</span>
                </div>

                <button
                  type="button"
                  onClick={() => toggleAvailability(plan)}
                  disabled={isSaving}
                  className={`mt-4 rounded-lg px-4 py-2.5 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 ${
                    plan.is_available
                      ? "border border-white/10 bg-white/5 text-white hover:bg-white/10"
                      : "bg-[var(--brand-gold)] text-black hover:opacity-90"
                  }`}
                >
                  {isSaving
                    ? "Saving..."
                    : plan.is_available
                      ? "Set unavailable"
                      : "Set available"}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
