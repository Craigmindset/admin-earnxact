"use client";

import { useEffect, useState, type FormEvent } from "react";
import { MdRefresh, MdSearch } from "react-icons/md";
import { createClient } from "@/lib/supabase/client";
import { CURRENCY_SYMBOL } from "@/lib/currency";
import type { AdminTransactionRow } from "@/lib/database.types";

function formatMoney(value: number | null | undefined) {
  return `${CURRENCY_SYMBOL}${Number(value ?? 0).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })}`;
}

function formatDateTime(value: string | null | undefined) {
  if (!value) return "—";
  return new Date(value).toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
}

function StatusBadge({ status }: { status: AdminTransactionRow["status"] }) {
  const styles: Record<AdminTransactionRow["status"], string> = {
    pending: "border-amber-500/30 bg-amber-500/10 text-amber-300",
    completed: "border-emerald-500/30 bg-emerald-500/10 text-emerald-300",
    failed: "border-red-500/30 bg-red-500/10 text-red-300"
  };

  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide ${styles[status]}`}>
      {status}
    </span>
  );
}

function TypeBadge({ type }: { type: AdminTransactionRow["type"] }) {
  const styles: Record<AdminTransactionRow["type"], string> = {
    credit: "border-emerald-500/30 bg-emerald-500/10 text-emerald-300",
    debit: "border-sky-500/30 bg-sky-500/10 text-sky-300",
    withdrawal: "border-amber-500/30 bg-amber-500/10 text-amber-300",
    bonus: "border-purple-500/30 bg-purple-500/10 text-purple-300"
  };

  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide ${styles[type]}`}>
      {type}
    </span>
  );
}

export default function AllTransactionsPage() {
  const [transactions, setTransactions] = useState<AdminTransactionRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [nameInput, setNameInput] = useState("");
  const [emailInput, setEmailInput] = useState("");
  const [amountInput, setAmountInput] = useState("");

  const [appliedFilters, setAppliedFilters] = useState({ name: "", email: "", amount: "" });

  async function loadTransactions(filters: { name: string; email: string; amount: string }) {
    setLoading(true);
    const supabase = createClient();
    const { data, error: rpcError } = await supabase.rpc("get_admin_transactions", {
      p_name: filters.name.trim() || null,
      p_email: filters.email.trim() || null,
      p_amount: filters.amount.trim() === "" ? null : Number(filters.amount)
    });

    if (rpcError) {
      setError(rpcError.message);
      setTransactions([]);
      setLoading(false);
      return;
    }

    setTransactions((data ?? []) as AdminTransactionRow[]);
    setError(null);
    setLoading(false);
  }

  useEffect(() => {
    loadTransactions(appliedFilters);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleFilterSubmit(event: FormEvent) {
    event.preventDefault();
    const filters = { name: nameInput, email: emailInput, amount: amountInput };
    setAppliedFilters(filters);
    loadTransactions(filters);
  }

  function handleReset() {
    setNameInput("");
    setEmailInput("");
    setAmountInput("");
    const filters = { name: "", email: "", amount: "" };
    setAppliedFilters(filters);
    loadTransactions(filters);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white md:text-3xl">All Transactions</h1>
          <p className="mt-1 text-sm text-white/50">
            Track every transaction made by users across the platform.
          </p>
        </div>

        <button
          type="button"
          onClick={() => loadTransactions(appliedFilters)}
          className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm font-medium text-white/80 transition hover:bg-white/10"
        >
          <MdRefresh className="text-base" />
          Refresh
        </button>
      </div>

      <form
        onSubmit={handleFilterSubmit}
        className="rounded-2xl border border-white/10 bg-white/5 p-4 md:p-5"
      >
        <div className="grid gap-3 sm:grid-cols-4">
          <div>
            <label className="text-xs font-medium text-white/60">User name</label>
            <input
              type="text"
              value={nameInput}
              onChange={(event) => setNameInput(event.target.value)}
              placeholder="e.g. Jane Doe"
              className="mt-1.5 w-full rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-sm text-white outline-none focus:border-[var(--brand-gold)]"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-white/60">Email</label>
            <input
              type="text"
              value={emailInput}
              onChange={(event) => setEmailInput(event.target.value)}
              placeholder="e.g. jane@email.com"
              className="mt-1.5 w-full rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-sm text-white outline-none focus:border-[var(--brand-gold)]"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-white/60">Amount</label>
            <input
              type="number"
              step="0.01"
              value={amountInput}
              onChange={(event) => setAmountInput(event.target.value)}
              placeholder="e.g. 5000"
              className="mt-1.5 w-full rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-sm text-white outline-none focus:border-[var(--brand-gold)]"
            />
          </div>

          <div className="flex items-end gap-2">
            <button
              type="submit"
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg bg-[var(--brand-gold)] px-3 py-2 text-sm font-semibold text-black transition hover:opacity-90"
            >
              <MdSearch className="text-base" />
              Filter
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm font-medium text-white/70 transition hover:bg-white/10"
            >
              Reset
            </button>
          </div>
        </div>
      </form>

      {error && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {error}
        </div>
      )}

      <div className="overflow-x-auto rounded-2xl border border-white/10 bg-white/5">
        <table className="w-full min-w-[1000px] text-left text-sm">
          <thead>
            <tr className="border-b border-white/10 text-xs uppercase tracking-wide text-white/50">
              <th className="px-4 py-3 font-medium">User</th>
              <th className="px-4 py-3 font-medium">Type</th>
              <th className="px-4 py-3 font-medium">Amount</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Reference</th>
              <th className="px-4 py-3 font-medium">Date</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-white/10">
            {loading && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-sm text-white/50">
                  Loading transactions...
                </td>
              </tr>
            )}

            {!loading && transactions.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-sm text-white/50">
                  No transactions found for this filter.
                </td>
              </tr>
            )}

            {transactions.map((transaction) => (
              <tr key={transaction.id} className="transition hover:bg-white/5">
                <td className="px-4 py-3">
                  <div className="font-medium text-white/85">
                    {transaction.first_name ?? ""} {transaction.last_name ?? ""}
                  </div>
                  <div className="text-xs text-white/45">{transaction.email}</div>
                </td>
                <td className="px-4 py-3">
                  <TypeBadge type={transaction.type} />
                </td>
                <td className="px-4 py-3 font-medium text-[var(--brand-gold)]">
                  {formatMoney(transaction.amount)}
                </td>
                <td className="px-4 py-3">
                  <StatusBadge status={transaction.status} />
                </td>
                <td className="px-4 py-3 text-white/60">{transaction.reference ?? "—"}</td>
                <td className="px-4 py-3 text-white/65">{formatDateTime(transaction.created_at)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {!loading && transactions.length > 0 && (
        <div className="text-xs text-white/45">
          Showing {transactions.length} transaction{transactions.length === 1 ? "" : "s"}.
        </div>
      )}
    </div>
  );
}
