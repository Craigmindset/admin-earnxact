"use client";

import { useEffect, useMemo, useState } from "react";
import { MdCheckCircle, MdPendingActions, MdRefresh } from "react-icons/md";
import { createClient } from "@/lib/supabase/client";
import type { AdminWithdrawalRow } from "@/lib/database.types";

const STATUS_OPTIONS = ["processing", "completed", "paid"] as const;

type WithdrawalStatus = (typeof STATUS_OPTIONS)[number];

function formatMoney(value: number | null | undefined) {
  return `₦${Number(value ?? 0).toLocaleString(undefined, {
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

function StatusBadge({ status }: { status: WithdrawalStatus }) {
  const styles = {
    processing: "border-amber-500/30 bg-amber-500/10 text-amber-300",
    completed: "border-sky-500/30 bg-sky-500/10 text-sky-300",
    paid: "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
  } as const;

  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide ${styles[status]}`}>
      {status}
    </span>
  );
}

export default function WithdrawalManagementPage() {
  const [requests, setRequests] = useState<AdminWithdrawalRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<"all" | WithdrawalStatus>("processing");

  async function loadRequests() {
    const supabase = createClient();
    const { data, error: rpcError } = await supabase.rpc("get_admin_withdrawal_requests", {
      p_status: statusFilter === "all" ? null : statusFilter
    });

    if (rpcError) {
      setError(rpcError.message);
      setRequests([]);
      setLoading(false);
      return;
    }

    setRequests((data ?? []) as AdminWithdrawalRow[]);
    setError(null);
    setLoading(false);
  }

  useEffect(() => {
    setLoading(true);
    loadRequests();
  }, [statusFilter]);

  const visibleCount = useMemo(
    () => requests.filter((request) => statusFilter === "all" || request.status === statusFilter).length,
    [requests, statusFilter]
  );

  async function handleStatusUpdate(requestId: string, nextStatus: WithdrawalStatus) {
    setUpdatingId(requestId);
    const supabase = createClient();
    const { error: rpcError } = await supabase.rpc("update_admin_withdrawal_status", {
      p_request_id: requestId,
      p_status: nextStatus
    });

    if (rpcError) {
      setError(rpcError.message);
      setUpdatingId(null);
      return;
    }

    setRequests((current) =>
      current.map((item) =>
        item.request_id === requestId ? { ...item, status: nextStatus } : item
      )
    );
    setError(null);
    setUpdatingId(null);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white md:text-3xl">Withdrawal Management</h1>
          <p className="mt-1 text-sm text-white/50">
            Review submitted withdrawals, verify bank details, and update request status.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setLoading(true);
            loadRequests();
          }}
          className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm font-medium text-white/80 transition hover:bg-white/10"
        >
          <MdRefresh className="text-base" />
          Refresh
        </button>
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
        <div className="flex flex-wrap gap-2">
          {(["all", "processing", "completed", "paid"] as const).map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setStatusFilter(option)}
              className={`rounded-lg border px-3 py-2 text-xs font-semibold uppercase tracking-wide transition ${
                statusFilter === option
                  ? "border-[var(--brand-gold)]/40 bg-[var(--brand-gold)]/15 text-[var(--brand-gold)]"
                  : "border-white/10 bg-black/20 text-white/60 hover:text-white"
              }`}
            >
              {option === "all" ? "All" : option}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {error}
        </div>
      )}

      <div className="overflow-x-auto rounded-2xl border border-white/10 bg-white/5">
        <table className="w-full min-w-[1100px] text-left text-sm">
          <thead>
            <tr className="border-b border-white/10 text-xs uppercase tracking-wide text-white/50">
              <th className="px-4 py-3 font-medium">User</th>
              <th className="px-4 py-3 font-medium">Bank</th>
              <th className="px-4 py-3 font-medium">Account Name</th>
              <th className="px-4 py-3 font-medium">Account Number</th>
              <th className="px-4 py-3 font-medium">Amount</th>
              <th className="px-4 py-3 font-medium">Date</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium text-right">Action</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-white/10">
            {!loading && requests.length === 0 && (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-sm text-white/50">
                  No withdrawal requests found for this filter.
                </td>
              </tr>
            )}

            {requests.map((request) => (
              <tr key={request.request_id} className="transition hover:bg-white/5">
                <td className="px-4 py-3">
                  <div className="font-medium text-white/85">
                    {request.first_name ?? ""} {request.last_name ?? ""}
                  </div>
                  <div className="text-xs text-white/45">{request.email}</div>
                </td>

                <td className="px-4 py-3 text-white/75">{request.bank_name}</td>
                <td className="px-4 py-3 text-white/75">{request.account_name}</td>
                <td className="px-4 py-3 text-white/75">{request.account_number}</td>
                <td className="px-4 py-3 font-medium text-[var(--brand-gold)]">
                  {formatMoney(request.amount_withdrawn)}
                </td>
                <td className="px-4 py-3 text-white/65">{formatDateTime(request.created_at)}</td>
                <td className="px-4 py-3">
                  <StatusBadge status={request.status} />
                </td>
                <td className="px-4 py-3 text-right">
                  {request.status === "processing" ? (
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        disabled={updatingId === request.request_id}
                        onClick={() => handleStatusUpdate(request.request_id, "completed")}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-sky-500/30 bg-sky-500/10 px-2.5 py-1.5 text-[11px] font-semibold text-sky-300 transition hover:bg-sky-500/15 disabled:opacity-60"
                      >
                        <MdPendingActions className="text-xs" />
                        Mark Completed
                      </button>
                      <button
                        type="button"
                        disabled={updatingId === request.request_id}
                        onClick={() => handleStatusUpdate(request.request_id, "paid")}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1.5 text-[11px] font-semibold text-emerald-300 transition hover:bg-emerald-500/15 disabled:opacity-60"
                      >
                        <MdCheckCircle className="text-xs" />
                        Mark Paid
                      </button>
                    </div>
                  ) : (
                    <span className="text-xs text-white/45">Locked</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {!loading && requests.length > 0 && (
        <div className="text-xs text-white/45">
          Showing {visibleCount} withdrawal request{visibleCount === 1 ? "" : "s"}.
        </div>
      )}
    </div>
  );
}
