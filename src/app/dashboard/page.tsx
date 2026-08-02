import {
  MdAttachMoney,
  MdCardMembership,
  MdGroups,
  MdOutlinePayments,
  MdTrendingUp
} from "react-icons/md";
import { CURRENCY_SYMBOL } from "@/lib/currency";

// Backend integration point:
// - Replace with real aggregate figures from your admin API.
const STATS = [
  {
    label: "Total Users",
    value: "12,480",
    icon: MdGroups,
    accent: "border-sky-500/20 bg-sky-500/10 text-sky-400"
  },
  {
    label: "Total Payouts",
    value: `${CURRENCY_SYMBOL}84,320,000`,
    icon: MdAttachMoney,
    accent: "border-emerald-500/20 bg-emerald-500/10 text-emerald-400"
  },
  {
    label: "Active Task Classes",
    value: "8",
    icon: MdCardMembership,
    accent: "border-[var(--brand-gold)]/20 bg-[var(--brand-gold)]/10 text-[var(--brand-gold)]"
  },
  {
    label: "Pending Withdrawals",
    value: "36",
    icon: MdOutlinePayments,
    accent: "border-red-500/20 bg-red-500/10 text-red-400"
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

export default function OverviewPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white md:text-3xl">Overview</h1>
        <p className="mt-1 text-sm text-white/50">
          A snapshot of platform activity and performance.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {STATS.map(({ label, value, icon: Icon, accent }) => (
          <div key={label} className={`rounded-2xl border p-5 ${accent}`}>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide">
              <Icon className="text-lg" />
              {label}
            </div>
            <div className="mt-2 text-2xl font-semibold text-white">{value}</div>
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
