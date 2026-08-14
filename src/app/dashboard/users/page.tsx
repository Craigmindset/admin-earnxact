"use client";

import { useEffect, useState } from "react";
import {
  MdCalendarMonth,
  MdCardMembership,
  MdClose,
  MdEmail,
  MdGroups,
  MdHistory,
  MdLocationOn,
  MdPerson,
  MdPhone,
  MdSearch,
  MdWallet
} from "react-icons/md";
import { createClient } from "@/lib/supabase/client";
import { CURRENCY_SYMBOL } from "@/lib/currency";
import type { AdminUserDetail, AdminUserListRow } from "@/lib/database.types";

const REFRESH_INTERVAL_MS = 30_000;

function formatDate(value: string | null | undefined) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric"
  });
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

function formatMoney(value: number | null | undefined) {
  return `${CURRENCY_SYMBOL}${Number(value ?? 0).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })}`;
}

function initialsOf(firstName: string | null, lastName: string | null) {
  const initials = `${firstName?.[0] ?? ""}${lastName?.[0] ?? ""}`.trim();
  return initials.length > 0 ? initials.toUpperCase() : "?";
}

function Avatar({
  avatarUrl,
  firstName,
  lastName,
  size = 12
}: {
  avatarUrl: string | null;
  firstName: string | null;
  lastName: string | null;
  size?: number;
}) {
  const dimension = `${size * 0.25}rem`;
  if (avatarUrl) {
    // eslint-disable-next-line @next/next/no-img-element
    return (
      <img
        src={avatarUrl}
        alt={`${firstName ?? ""} ${lastName ?? ""}`.trim() || "User avatar"}
        style={{ width: dimension, height: dimension }}
        className="shrink-0 rounded-full border border-white/15 object-cover"
      />
    );
  }

  return (
    <div
      style={{ width: dimension, height: dimension }}
      className="flex shrink-0 items-center justify-center rounded-full border border-white/15 bg-[var(--brand-gold)]/20 text-sm font-semibold text-[var(--brand-gold)]"
    >
      {initialsOf(firstName, lastName)}
    </div>
  );
}

function UserDetailModal({ userId, onClose }: { userId: string; onClose: () => void }) {
  const [detail, setDetail] = useState<AdminUserDetail | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const supabase = createClient();

    async function loadDetail() {
      const { data, error: rpcError } = await supabase.rpc("get_admin_user_detail", {
        p_user_id: userId
      });

      if (cancelled) return;

      if (rpcError) {
        setError(rpcError.message);
        return;
      }

      setDetail(data as AdminUserDetail);
    }

    loadDetail();
    return () => {
      cancelled = true;
    };
  }, [userId]);

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4"
      role="dialog"
      aria-modal="true"
    >
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-white/10 bg-[var(--brand-black)] shadow-xl">
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-white">User Details</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-white/70 transition hover:bg-white/10 hover:text-white"
          >
            <MdClose className="text-lg" />
          </button>
        </div>

        {error && (
          <div className="m-5 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            {error}
          </div>
        )}

        {!detail && !error && (
          <div className="p-10 text-center text-sm text-white/50">Loading user details…</div>
        )}

        {detail && (
          <div className="space-y-5 p-5">
            {/* Profile header */}
            <div className="flex flex-wrap items-center gap-4 rounded-2xl border border-white/10 bg-white/5 p-4">
              <Avatar avatarUrl={detail.avatar_url} firstName={detail.first_name} lastName={detail.last_name} size={16} />
              <div className="min-w-0">
                <div className="truncate text-base font-semibold text-white">
                  {detail.first_name ?? ""} {detail.last_name ?? ""}
                </div>
                <div className="mt-0.5 inline-flex items-center gap-1 rounded-full bg-[var(--brand-gold)]/10 px-2.5 py-0.5 text-[11px] font-semibold text-[var(--brand-gold)]">
                  <MdCardMembership className="text-xs" />
                  {detail.membership_plan_name}
                </div>
              </div>
            </div>

            {/* Contact info */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                <div className="flex items-center gap-1.5 text-[11px] uppercase tracking-wide text-white/40">
                  <MdEmail /> Email
                </div>
                <div className="mt-1 truncate text-sm text-white/85">{detail.email}</div>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                <div className="flex items-center gap-1.5 text-[11px] uppercase tracking-wide text-white/40">
                  <MdPhone /> Phone Number
                </div>
                <div className="mt-1 text-sm text-white/85">{detail.phone_num ?? "—"}</div>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                <div className="flex items-center gap-1.5 text-[11px] uppercase tracking-wide text-white/40">
                  <MdLocationOn /> IP Address
                </div>
                <div className="mt-1 text-sm text-white/85">{detail.ip_address ?? "—"}</div>
              </div>
            </div>

            {/* Wallet / membership / dates */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-3">
                <div className="flex items-center gap-1.5 text-[11px] uppercase tracking-wide text-emerald-300/80">
                  <MdWallet /> Wallet Balance
                </div>
                <div className="mt-1 text-sm font-semibold text-white">{formatMoney(detail.wallet_balance)}</div>
              </div>
              <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-3">
                <div className="flex items-center gap-1.5 text-[11px] uppercase tracking-wide text-red-300/80">
                  <MdHistory /> Total Withdrawn
                </div>
                <div className="mt-1 text-sm font-semibold text-white">{formatMoney(detail.total_withdrawn)}</div>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                <div className="flex items-center gap-1.5 text-[11px] uppercase tracking-wide text-white/40">
                  <MdCalendarMonth /> Date Joined
                </div>
                <div className="mt-1 text-sm text-white/85">{formatDate(detail.joined_at)}</div>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                <div className="flex items-center gap-1.5 text-[11px] uppercase tracking-wide text-white/40">
                  <MdHistory /> Last Withdrawal
                </div>
                <div className="mt-1 text-sm text-white/85">
                  {detail.last_withdrawal
                    ? `${formatMoney(detail.last_withdrawal.amount)} · ${detail.last_withdrawal.status}`
                    : "No withdrawals yet"}
                </div>
                {detail.last_withdrawal && (
                  <div className="mt-0.5 text-xs text-white/40">{formatDateTime(detail.last_withdrawal.created_at)}</div>
                )}
              </div>
            </div>

            {/* Referrals */}
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-white">
                <MdGroups className="text-[var(--brand-gold)]" />
                Users Referred ({detail.referrals.length})
              </div>
              {detail.referrals.length === 0 ? (
                <p className="mt-3 text-sm text-white/40">This user hasn&apos;t referred anyone yet.</p>
              ) : (
                <div className="mt-3 divide-y divide-white/10 overflow-hidden rounded-xl border border-white/10">
                  {detail.referrals.map((referral) => (
                    <div key={referral.user_id} className="flex items-center justify-between gap-3 px-3 py-2 text-sm">
                      <span className="truncate text-white/80">
                        {referral.first_name ?? ""} {referral.last_name ?? ""}
                        <span className="ml-2 text-xs text-white/40">{referral.email}</span>
                      </span>
                      <span className="shrink-0 text-xs text-white/40">{formatDate(referral.joined_at)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Purchase history */}
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-white">
                <MdCardMembership className="text-[var(--brand-gold)]" />
                Plans Paid For ({detail.purchases.length})
              </div>
              {detail.purchases.length === 0 ? (
                <p className="mt-3 text-sm text-white/40">No EarnPass purchases yet.</p>
              ) : (
                <div className="mt-3 divide-y divide-white/10 overflow-hidden rounded-xl border border-white/10">
                  {detail.purchases.map((purchase) => (
                    <div key={purchase.reference} className="flex items-center justify-between gap-3 px-3 py-2 text-sm">
                      <span className="truncate text-white/80">{purchase.description}</span>
                      <span className="shrink-0 text-xs text-[var(--brand-gold)]">{formatMoney(purchase.amount)}</span>
                      <span className="hidden shrink-0 text-xs text-white/40 sm:inline">
                        {formatDate(purchase.created_at)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function UsersPage() {
  const [query, setQuery] = useState("");
  const [users, setUsers] = useState<AdminUserListRow[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const supabase = createClient();

    async function loadUsers() {
      const { data, error: rpcError } = await supabase.rpc("get_admin_users_list");
      if (cancelled) return;

      if (rpcError) {
        setError(rpcError.message);
        return;
      }

      setError(null);
      setUsers(data ?? []);
    }

    loadUsers();
    const interval = setInterval(loadUsers, REFRESH_INTERVAL_MS);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  const filteredUsers = users.filter((user) =>
    `${user.first_name ?? ""} ${user.last_name ?? ""} ${user.email}`.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white md:text-3xl">Users</h1>
        <p className="mt-1 text-sm text-white/50">
          Manage registered users, their membership plan and account activity.
        </p>
      </div>

      {error && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          Couldn&apos;t load users: {error}
        </div>
      )}

      <div className="relative max-w-sm">
        <MdSearch className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-lg text-white/40" />
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          type="text"
          placeholder="Search by name or email"
          className="w-full rounded-lg border border-white/10 bg-black/20 py-2.5 pl-9 pr-3 text-sm text-white outline-none focus:border-[var(--brand-gold)]"
        />
      </div>

      <div className="overflow-x-auto rounded-2xl border border-white/10 bg-white/5">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead>
            <tr className="border-b border-white/10 text-xs uppercase tracking-wide text-white/50">
              <th className="px-4 py-3 font-medium">User</th>
              <th className="px-4 py-3 font-medium">Membership</th>
              <th className="px-4 py-3 font-medium">Wallet</th>
              <th className="px-4 py-3 font-medium">Referrals</th>
              <th className="px-4 py-3 font-medium">Joined</th>
              <th className="px-4 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {filteredUsers.map((user) => (
              <tr key={user.user_id} className="transition hover:bg-white/5">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <Avatar avatarUrl={user.avatar_url} firstName={user.first_name} lastName={user.last_name} />
                    <div className="min-w-0">
                      <div className="truncate font-medium text-white/80">
                        {user.first_name ?? ""} {user.last_name ?? ""}
                      </div>
                      <div className="truncate text-xs text-white/40">{user.email}</div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-white/60">{user.membership_plan_name ?? "Free"}</td>
                <td className="px-4 py-3 text-white/60">{formatMoney(user.wallet_balance)}</td>
                <td className="px-4 py-3 text-white/60">{user.referrals_count.toLocaleString()}</td>
                <td className="px-4 py-3 text-white/60">{formatDate(user.joined_at)}</td>
                <td className="px-4 py-3 text-right">
                  <button
                    type="button"
                    onClick={() => setSelectedUserId(user.user_id)}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-white/80 transition hover:bg-white/10"
                  >
                    <MdPerson className="text-sm" />
                    View
                  </button>
                </td>
              </tr>
            ))}

            {filteredUsers.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-white/40">
                  No users match your search.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {selectedUserId && (
        <UserDetailModal userId={selectedUserId} onClose={() => setSelectedUserId(null)} />
      )}
    </div>
  );
}

