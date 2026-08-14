"use client";

import { useEffect, useState } from "react";
import {
  MdAccountBalanceWallet,
  MdAttachMoney,
  MdGroups,
  MdOutlinePayments,
  MdOutlineHourglassEmpty,
  MdBarChart
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

type SignupTrendRow = { period: string; user_count: number };
type PlanDistRow = { plan_name: string; user_count: number };
type TopAmountRow = { label: string; amount: number };

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

const REFRESH_INTERVAL_MS = 30_000;

export default function OverviewPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [signupTrend, setSignupTrend] = useState<SignupTrendRow[]>([]);
  const [planDist, setPlanDist] = useState<PlanDistRow[]>([]);
  const [topAmounts, setTopAmounts] = useState<TopAmountRow[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const supabase = createClient();

    async function loadAllData() {
      const [statsRes, trendRes, distRes, topRes] = await Promise.all([
        supabase.rpc("get_admin_dashboard_stats"),
        supabase.rpc("get_admin_signup_trend"),
        supabase.rpc("get_admin_plan_distribution"),
        supabase.rpc("get_admin_top_amounts")
      ]);

      if (cancelled) return;

      if (statsRes.error) {
        setError(statsRes.error.message);
        return;
      }

      setError(null);
      setStats(statsRes.data?.[0] ?? null);
      setSignupTrend((trendRes.data ?? []) as SignupTrendRow[]);
      setPlanDist((distRes.data ?? []) as PlanDistRow[]);
      setTopAmounts((topRes.data ?? []) as TopAmountRow[]);
    }

    loadAllData();
    const interval = setInterval(loadAllData, REFRESH_INTERVAL_MS);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  const maxSignups = Math.max(...signupTrend.map((r) => r.user_count), 1);
  const maxPlanUsers = Math.max(...planDist.map((r) => r.user_count), 1);

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

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Signup Trend Histogram */}
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4 md:p-5">
          <div className="flex items-center gap-2">
            <MdBarChart className="text-base text-sky-400" />
            <h2 className="text-xs font-semibold uppercase tracking-wide text-white md:text-sm">
              Signup Trend
            </h2>
          </div>

          <div className="mt-4">
            <svg viewBox="0 0 400 140" className="w-full" preserveAspectRatio="xMidYMid meet">
              {/* Y-axis grid lines */}
              {[0, 1, 2, 3, 4].map((i) => (
                <line
                  key={i}
                  x1="40"
                  y1={110 - i * 27.5}
                  x2="400"
                  y2={110 - i * 27.5}
                  stroke="rgba(255,255,255,0.05)"
                  strokeWidth="1"
                />
              ))}
              
              {/* Bars */}
              {signupTrend.map((row, idx) => {
                const barWidth = 70;
                const x = 60 + idx * 110;
                const barHeight = maxSignups > 0 ? (row.user_count / maxSignups) * 95 : 0;
                const y = 110 - barHeight;
                
                return (
                  <g key={row.period}>
                    {/* Bar with gradient */}
                    <defs>
                      <linearGradient id={`skyGrad${idx}`} x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="rgb(56, 189, 248)" stopOpacity="0.9" />
                        <stop offset="100%" stopColor="rgb(14, 165, 233)" stopOpacity="0.7" />
                      </linearGradient>
                    </defs>
                    <rect
                      x={x}
                      y={y}
                      width={barWidth}
                      height={barHeight}
                      fill={`url(#skyGrad${idx})`}
                      rx="3"
                      className="transition-all duration-300"
                    />
                    {/* Value on top */}
                    <text
                      x={x + barWidth / 2}
                      y={y - 6}
                      textAnchor="middle"
                      className="fill-sky-400 text-[11px] font-bold"
                    >
                      {row.user_count}
                    </text>
                    {/* Label at bottom */}
                    <text
                      x={x + barWidth / 2}
                      y="130"
                      textAnchor="middle"
                      className="fill-white/70 text-[10px] font-medium"
                    >
                      {row.period}
                    </text>
                  </g>
                );
              })}
              
              {/* Y-axis labels */}
              {[0, 1, 2, 3, 4].map((i) => {
                const value = Math.round((maxSignups / 4) * i);
                return (
                  <text
                    key={i}
                    x="35"
                    y={113 - i * 27.5}
                    textAnchor="end"
                    className="fill-white/50 text-[9px]"
                  >
                    {value}
                  </text>
                );
              })}
            </svg>
          </div>
        </div>

        {/* Membership Plan Distribution Histogram */}
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4 md:p-5">
          <div className="flex items-center gap-2">
            <MdBarChart className="text-base text-emerald-400" />
            <h2 className="text-xs font-semibold uppercase tracking-wide text-white md:text-sm">
              Users per Membership Plan
            </h2>
          </div>

          <div className="mt-4">
            <svg viewBox="0 0 400 140" className="w-full" preserveAspectRatio="xMidYMid meet">
              {/* Y-axis grid lines */}
              {[0, 1, 2, 3, 4].map((i) => (
                <line
                  key={i}
                  x1="40"
                  y1={110 - i * 27.5}
                  x2="400"
                  y2={110 - i * 27.5}
                  stroke="rgba(255,255,255,0.05)"
                  strokeWidth="1"
                />
              ))}
              
              {/* Bars */}
              {planDist.map((row, idx) => {
                const barWidth = Math.min(55, 320 / planDist.length);
                const spacing = 340 / (planDist.length + 1);
                const x = 40 + spacing * (idx + 1) - barWidth / 2;
                const barHeight = maxPlanUsers > 0 ? (row.user_count / maxPlanUsers) * 95 : 0;
                const y = 110 - barHeight;
                
                return (
                  <g key={row.plan_name}>
                    {/* Bar with gradient */}
                    <defs>
                      <linearGradient id={`emeraldGrad${idx}`} x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="rgb(52, 211, 153)" stopOpacity="0.9" />
                        <stop offset="100%" stopColor="rgb(16, 185, 129)" stopOpacity="0.7" />
                      </linearGradient>
                    </defs>
                    <rect
                      x={x}
                      y={y}
                      width={barWidth}
                      height={barHeight}
                      fill={`url(#emeraldGrad${idx})`}
                      rx="3"
                      className="transition-all duration-300"
                    />
                    {/* Value on top */}
                    <text
                      x={x + barWidth / 2}
                      y={y - 6}
                      textAnchor="middle"
                      className="fill-emerald-400 text-[11px] font-bold"
                    >
                      {row.user_count}
                    </text>
                    {/* Label at bottom */}
                    <text
                      x={x + barWidth / 2}
                      y="130"
                      textAnchor="middle"
                      className="fill-white/70 text-[9px] font-medium"
                    >
                      {row.plan_name.length > 10 ? row.plan_name.substring(0, 9) + '…' : row.plan_name}
                    </text>
                  </g>
                );
              })}
              
              {/* Y-axis labels */}
              {[0, 1, 2, 3, 4].map((i) => {
                const value = Math.round((maxPlanUsers / 4) * i);
                return (
                  <text
                    key={i}
                    x="35"
                    y={113 - i * 27.5}
                    textAnchor="end"
                    className="fill-white/50 text-[9px]"
                  >
                    {value}
                  </text>
                );
              })}
            </svg>
          </div>
        </div>

        {/* Peak Transactions Histogram */}
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4 md:p-5 lg:col-span-2">
          <div className="flex items-center gap-2">
            <MdBarChart className="text-base text-[var(--brand-gold)]" />
            <h2 className="text-xs font-semibold uppercase tracking-wide text-white md:text-sm">
              Peak Transactions
            </h2>
          </div>

          <div className="mt-4">
            <svg viewBox="0 0 500 140" className="w-full" preserveAspectRatio="xMidYMid meet">
              {/* Y-axis grid lines */}
              {[0, 1, 2, 3, 4].map((i) => (
                <line
                  key={i}
                  x1="60"
                  y1={110 - i * 27.5}
                  x2="500"
                  y2={110 - i * 27.5}
                  stroke="rgba(255,255,255,0.05)"
                  strokeWidth="1"
                />
              ))}
              
              {/* Bars */}
              {topAmounts.map((row, idx) => {
                const maxAmount = Math.max(...topAmounts.map(r => Number(r.amount)), 1);
                const barWidth = 100;
                const x = 140 + idx * 180;
                const barHeight = (Number(row.amount) / maxAmount) * 95;
                const y = 110 - barHeight;
                
                return (
                  <g key={row.label}>
                    {/* Bar with gradient */}
                    <defs>
                      <linearGradient id={`goldGrad${idx}`} x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="rgb(234, 179, 8)" stopOpacity="0.9" />
                        <stop offset="100%" stopColor="rgb(202, 138, 4)" stopOpacity="0.7" />
                      </linearGradient>
                    </defs>
                    <rect
                      x={x}
                      y={y}
                      width={barWidth}
                      height={barHeight}
                      fill={`url(#goldGrad${idx})`}
                      rx="3"
                      className="transition-all duration-300"
                    />
                    {/* Value on top */}
                    <text
                      x={x + barWidth / 2}
                      y={y - 6}
                      textAnchor="middle"
                      className="fill-[var(--brand-gold)] text-[11px] font-bold"
                    >
                      {CURRENCY_SYMBOL}{Number(row.amount).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                    </text>
                    {/* Label at bottom */}
                    <text
                      x={x + barWidth / 2}
                      y="130"
                      textAnchor="middle"
                      className="fill-white/70 text-[10px] font-medium"
                    >
                      {row.label}
                    </text>
                  </g>
                );
              })}
              
              {/* Y-axis labels */}
              {[0, 1, 2, 3, 4].map((i) => {
                const maxAmount = Math.max(...topAmounts.map(r => Number(r.amount)), 1);
                const value = (maxAmount / 4) * i;
                return (
                  <text
                    key={i}
                    x="55"
                    y={113 - i * 27.5}
                    textAnchor="end"
                    className="fill-white/50 text-[9px]"
                  >
                    {value >= 1000 ? `${(value / 1000).toFixed(0)}k` : value.toFixed(0)}
                  </text>
                );
              })}
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}

