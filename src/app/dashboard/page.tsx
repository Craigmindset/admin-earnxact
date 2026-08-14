"use client";

import { useEffect, useState } from "react";
import {
  MdAccountBalanceWallet,
  MdAttachMoney,
  MdGroups,
  MdOutlinePayments,
  MdOutlineHourglassEmpty,
  MdTrendingUp
} from "react-icons/md";
import { CURRENCY_SYMBOL } from "@/lib/currency";
import { createClient } from "@/lib/supabase/client";

type DashboardStats = {
  total_users: number;
  total_pay_in: number;
  total_payout: number;
  pending_withdrawals: number;
  admin_balance: number;
};

const STAT_CARDS = [
  {
    key: "total_users" as const,
    label: "Total Users",
    icon: MdGroups,
    accent: "border-sky-500/20 bg-sky-500/10 text-sky-400",
    format: (value: number) => value.toLocaleString()
  },
  {
    key: "total_pay_in" as const,
    label: "Total Pay-in",
    icon: MdAttachMoney,
    accent: "border-emerald-500/20 bg-emerald-500/10 text-emerald-400",
    format: (value: number) => `${CURRENCY_SYMBOL}${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  },
  {
    key: "total_payout" as const,
    label: "Total Payout",
    icon: MdOutlinePayments,
    accent: "border-[var(--brand-gold)]/20 bg-[var(--brand-gold)]/10 text-[var(--brand-gold)]",
    format: (value: number) => `${CURRENCY_SYMBOL}${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  },
  {
    key: "pending_withdrawals" as const,
    label: "Pending Withdrawal",
    icon: MdOutlineHourglassEmpty,
    accent: "border-red-500/20 bg-red-500/10 text-red-400",
    format: (value: number) => value.toLocaleString()
  },
  {
    key: "admin_balance" as const,
    label: "Admin Balance",
    icon: MdAccountBalanceWallet,
    accent: "border-violet-500/20 bg-violet-500/10 text-violet-400",
    format: (value: number) => `${CURRENCY_SYMBOL}${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  }
];

// Backend integration point:
// - Replace with a real activity/audit log feed from your admin API.
const RECENT_ACTIVITY = [
  { text: "New user \"grinder_jane\" registered", time: "2m ago" },
  { text: "Withdrawal request from \"cash_king\" approved", time: "18m ago" },
  { text: "Mission \"Daily Survey Blitz\" created", time: "1h ago" },
  { text: "User \"quickcash01\" upgraded to Executive", time: "3h ago" },
  { text: "Withdrawal request from \"dailygrind\" flagged for review", time: "5h ago" }
];

const REFRESH_INTERVAL_MS = 30_000;

export default function OverviewPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const supabase = createClient();

    async function loadStats() {
      const { data, error: rpcError } = await supabase.rpc("get_admin_dashboard_stats");
      if (cancelled) return;

      if (rpcError) {
        setError(rpcError.message);
        return;
      }

      setError(null);
      setStats(data?.[0] ?? null);
    }

    loadStats();
    const interval = setInterval(loadStats, REFRESH_INTERVAL_MS);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white md:text-3xl">Overview</h1>
        <p className="mt-1 text-sm text-white/50">
          A snapshot of platform activity and performance.
        </p>
      </div>

      {error && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          Couldn&apos;t load dashboard stats: {error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {STAT_CARDS.map(({ key, label, icon: Icon, accent, format }) => (
          <div key={key} className={`rounded-2xl border p-5 ${accent}`}>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide">
              <Icon className="text-lg" />
              {label}
            </div>
            <div className="mt-2 text-2xl font-semibold text-white">
              {stats ? format(stats[key]) : "…"}
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/5 p-5 md:p-6">
        <div className="flex items-center gap-2">
          <MdTrendingUp className="text-lg text-[var(--brand-gold)]" />
          <h2 className="text-sm font-semibold uppercase tracking-wide text-white md:text-base">
            Recent Activity
          </h2>
        </div>

        <div className="mt-4 divide-y divide-white/10 overflow-hidden rounded-xl border border-white/10">
          {RECENT_ACTIVITY.map((entry, index) => (
            <div
              key={index}
              className="flex items-center justify-between gap-3 px-4 py-3 text-sm transition hover:bg-white/5"
            >
              <span className="text-white/80">{entry.text}</span>
              <span className="shrink-0 text-xs text-white/40">{entry.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

