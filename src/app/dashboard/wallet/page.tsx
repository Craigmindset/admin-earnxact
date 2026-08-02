"use client";

import { useState } from "react";
import { MdAccountBalanceWallet } from "react-icons/md";
import { CURRENCY_SYMBOL } from "@/lib/currency";

// Backend integration point:
// - Replace with the real platform wallet balance from your admin API.
const PLATFORM_BALANCE = 42500000;

type WithdrawalStatus = "pending" | "approved" | "rejected";

type Withdrawal = {
  user: string;
  amount: number;
  method: string;
  status: WithdrawalStatus;
};

// Backend integration point:
// - Replace with real pending withdrawal requests from your admin API.
const INITIAL_WITHDRAWALS: Withdrawal[] = [
  { user: "cash_king", amount: 128400, method: "Bank Transfer", status: "pending" },
  { user: "grinder_jane", amount: 96750, method: "Bank Transfer", status: "pending" },
  { user: "dailygrind", amount: 58100, method: "Crypto", status: "pending" },
  { user: "steadyearns", amount: 18300, method: "Bank Transfer", status: "approved" }
];

function StatusBadge({ status }: { status: WithdrawalStatus }) {
  const styles: Record<WithdrawalStatus, string> = {
    pending: "bg-amber-500/10 text-amber-400",
    approved: "bg-emerald-500/10 text-emerald-400",
    rejected: "bg-red-500/10 text-red-400"
  };

  return (
    <span className={`rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide ${styles[status]}`}>
      {status}
    </span>
  );
}

export default function WalletPage() {
  const [withdrawals, setWithdrawals] = useState(INITIAL_WITHDRAWALS);

  function updateStatus(user: string, status: WithdrawalStatus) {
    setWithdrawals((current) =>
      current.map((withdrawal) =>
        withdrawal.user === user ? { ...withdrawal, status } : withdrawal
      )
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white md:text-3xl">Wallet</h1>
        <p className="mt-1 text-sm text-white/50">
          Monitor the platform wallet and review pending withdrawal requests.
        </p>
      </div>

      <div className="rounded-2xl border border-[var(--brand-gold)]/20 bg-[var(--brand-gold)]/10 p-5 md:p-6">
        <div className="flex items-center gap-2 text-[var(--brand-gold)]">
          <MdAccountBalanceWallet className="text-xl" />
          <span className="text-xs font-semibold uppercase tracking-wide">
            Platform Balance
          </span>
        </div>
        <div className="mt-2 text-2xl font-semibold text-white">
          {CURRENCY_SYMBOL}
          {PLATFORM_BALANCE.toLocaleString()}
        </div>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-white/10 bg-white/5">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead>
            <tr className="border-b border-white/10 text-xs uppercase tracking-wide text-white/50">
              <th className="px-4 py-3 font-medium">User</th>
              <th className="px-4 py-3 font-medium">Amount</th>
              <th className="px-4 py-3 font-medium">Method</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {withdrawals.map((withdrawal) => (
              <tr key={withdrawal.user} className="transition hover:bg-white/5">
                <td className="px-4 py-3 font-medium text-white/80">{withdrawal.user}</td>
                <td className="px-4 py-3 text-[var(--brand-gold)]">
                  {CURRENCY_SYMBOL}
                  {withdrawal.amount.toLocaleString()}
                </td>
                <td className="px-4 py-3 text-white/60">{withdrawal.method}</td>
                <td className="px-4 py-3">
                  <StatusBadge status={withdrawal.status} />
                </td>
                <td className="px-4 py-3 text-right">
                  {withdrawal.status === "pending" ? (
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => updateStatus(withdrawal.user, "approved")}
                        className="rounded-lg bg-emerald-500/15 px-3 py-1.5 text-xs font-semibold text-emerald-400 transition hover:bg-emerald-500/25"
                      >
                        Approve
                      </button>
                      <button
                        type="button"
                        onClick={() => updateStatus(withdrawal.user, "rejected")}
                        className="rounded-lg bg-red-500/15 px-3 py-1.5 text-xs font-semibold text-red-400 transition hover:bg-red-500/25"
                      >
                        Reject
                      </button>
                    </div>
                  ) : (
                    <span className="text-xs text-white/40">No action needed</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
