"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { AdminStaffMember } from "@/lib/database.types";

function formatDate(value: string | null | undefined) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric"
  });
}

export default function AccountManagementPage() {
  const [staff, setStaff] = useState<AdminStaffMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function loadStaff() {
    const supabase = createClient();
    const { data, error: rpcError } = await supabase.rpc("get_admin_staff_list");

    if (rpcError) {
      setError(rpcError.message);
      setLoading(false);
      return;
    }

    setStaff((data ?? []) as AdminStaffMember[]);
    setError(null);
    setLoading(false);
  }

  useEffect(() => {
    loadStaff();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white md:text-3xl">Account Management</h1>
          <p className="mt-1 text-sm text-white/50">
            Invite an existing user to the admin dashboard and manage current admin access.
          </p>
        </div>
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/5 p-5 md:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-base font-semibold text-white">Admin access</h2>
            <p className="mt-1 text-sm text-white/50">
              Create a new admin account with Supabase Auth, then this account is automatically flagged as admin.
            </p>
          </div>

          <Link
            href="/dashboard/account-management/create-admin"
            className="inline-flex items-center justify-center rounded-lg bg-[var(--brand-gold)] px-4 py-2.5 text-sm font-semibold text-black transition hover:opacity-90"
          >
            Create Admin Account
          </Link>
        </div>

        {error && (
          <div className="mt-4 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">
            {error}
          </div>
        )}
      </div>

      <div className="overflow-x-auto rounded-2xl border border-white/10 bg-white/5">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead>
            <tr className="border-b border-white/10 text-xs uppercase tracking-wide text-white/50">
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium">Email</th>
              <th className="px-4 py-3 font-medium">Joined</th>
              <th className="px-4 py-3 font-medium">Role</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {loading && (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-sm text-white/50">
                  Loading admin accounts...
                </td>
              </tr>
            )}

            {!loading && staff.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-sm text-white/50">
                  No admin users yet.
                </td>
              </tr>
            )}

            {staff.map((member) => (
              <tr key={member.user_id} className="transition hover:bg-white/5">
                <td className="px-4 py-3 font-medium text-white/80">
                  {member.first_name ?? ""} {member.last_name ?? ""}
                </td>
                <td className="px-4 py-3 text-white/60">{member.email}</td>
                <td className="px-4 py-3 text-white/60">{formatDate(member.created_at)}</td>
                <td className="px-4 py-3">
                  <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-emerald-300">
                    Admin
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
