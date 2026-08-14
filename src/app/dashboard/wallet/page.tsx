"use client";

import { useEffect, useState } from "react";
import { MdAccountBalanceWallet, MdPerson, MdRefresh } from "react-icons/md";
import { CURRENCY_SYMBOL } from "@/lib/currency";
import { createClient } from "@/lib/supabase/client";

type UserWallet = {
  user_id: string;
  first_name: string;
  last_name: string;
  email: string;
  membership_plan_name: string;
  balance: number;
  created_at: string;
};

const REFRESH_INTERVAL_MS = 30_000;

export default function WalletPage() {
  const [users, setUsers] = useState<UserWallet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const supabase = createClient();

  async function loadUsers() {
    const { data, error: err } = await supabase.rpc("get_admin_wallet_overview");

    if (err) {
      setError(err.message);
      setLoading(false);
      return;
    }

    setUsers((data as UserWallet[]) ?? []);
    setError(null);
    setLoading(false);
  }

  useEffect(() => {
    const realtimeClient = createClient();

    loadUsers();

    const channel = realtimeClient
      .channel("admin_wallet_overview")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "user_profile" },
        () => {
          loadUsers();
        }
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "membership_plans" },
        () => {
          loadUsers();
        }
      )
      .subscribe();

    const interval = setInterval(loadUsers, REFRESH_INTERVAL_MS);
    return () => {
      clearInterval(interval);
      realtimeClient.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filteredUsers = users.filter((user) => {
    const query = searchQuery.toLowerCase();
    return (
      user.first_name?.toLowerCase().includes(query) ||
      user.last_name?.toLowerCase().includes(query) ||
      user.email?.toLowerCase().includes(query) ||
      user.membership_plan_name?.toLowerCase().includes(query)
    );
  });

  const totalBalance = users.reduce((sum, user) => sum + Number(user.balance), 0);

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-white/50">Loading wallet data...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white md:text-3xl">Wallet Overview</h1>
          <p className="mt-1 text-sm text-white/50">
            Monitor all user wallet balances across the platform
          </p>
        </div>

        <button
          onClick={loadUsers}
          className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-semibold text-white/80 transition hover:bg-white/10"
        >
          <MdRefresh className="text-base" />
          Refresh
        </button>
      </div>

      {error && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {error}
        </div>
      )}

      {/* Total Balance Card */}
      <div className="rounded-2xl border border-[var(--brand-gold)]/20 bg-[var(--brand-gold)]/10 p-5 md:p-6">
        <div className="flex items-center gap-2 text-[var(--brand-gold)]">
          <MdAccountBalanceWallet className="text-xl" />
          <span className="text-xs font-semibold uppercase tracking-wide">
            Total Platform Balance
          </span>
        </div>
        <div className="mt-2 text-2xl font-semibold text-white md:text-3xl">
          {CURRENCY_SYMBOL}
          {totalBalance.toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
          })}
        </div>
        <p className="mt-1 text-xs text-white/40">{users.length} users</p>
      </div>

      {/* Search */}
      <div className="relative">
        <input
          type="text"
          placeholder="Search by name, email, or membership..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-white/40 outline-none transition focus:border-white/20 focus:bg-white/10"
        />
      </div>

      {/* Users Table */}
      <div className="overflow-x-auto rounded-2xl border border-white/10 bg-white/5">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead>
            <tr className="border-b border-white/10 text-xs uppercase tracking-wide text-white/50">
              <th className="px-4 py-3 font-medium">User</th>
              <th className="px-4 py-3 font-medium">Email</th>
              <th className="px-4 py-3 font-medium">Membership</th>
              <th className="px-4 py-3 font-medium text-right">Wallet Balance</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {filteredUsers.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-white/40">
                  {searchQuery ? "No users found matching your search" : "No users found"}
                </td>
              </tr>
            ) : (
              filteredUsers.map((user) => (
                <tr key={user.user_id} className="transition hover:bg-white/5">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <MdPerson className="text-white/40" />
                      <div>
                        <p className="font-medium text-white/80">
                          {user.first_name} {user.last_name}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-white/60">{user.email}</td>
                  <td className="px-4 py-3">
                    <span className="rounded-full bg-sky-500/20 px-2.5 py-1 text-xs font-medium text-sky-400">
                      {user.membership_plan_name || "No Plan"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right font-semibold text-[var(--brand-gold)]">
                    {CURRENCY_SYMBOL}
                    {Number(user.balance).toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2
                    })}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
