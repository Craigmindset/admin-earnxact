"use client";

import { useState } from "react";

type StaffStatus = "active" | "disabled";

type StaffMember = {
  name: string;
  email: string;
  role: string;
  status: StaffStatus;
};

// Backend integration point:
// - Replace with real admin/staff account data from your admin API.
const INITIAL_STAFF: StaffMember[] = [
  { name: "Amaka Obi", email: "amaka@earnxact.com", role: "Super Admin", status: "active" },
  { name: "Chidi Eze", email: "chidi@earnxact.com", role: "Finance", status: "active" },
  { name: "Femi Adio", email: "femi@earnxact.com", role: "Support", status: "active" },
  { name: "Ngozi Bello", email: "ngozi@earnxact.com", role: "Support", status: "disabled" }
];

function StatusBadge({ status }: { status: StaffStatus }) {
  return (
    <span
      className={`rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide ${
        status === "active"
          ? "bg-emerald-500/10 text-emerald-400"
          : "bg-red-500/10 text-red-400"
      }`}
    >
      {status}
    </span>
  );
}

export default function AccountManagementPage() {
  const [staff, setStaff] = useState(INITIAL_STAFF);

  function toggleStatus(email: string) {
    setStaff((current) =>
      current.map((member) =>
        member.email === email
          ? { ...member, status: member.status === "active" ? "disabled" : "active" }
          : member
      )
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white md:text-3xl">
            Account Management
          </h1>
          <p className="mt-1 text-sm text-white/50">
            Manage admin and staff accounts with access to this dashboard.
          </p>
        </div>

        <button
          type="button"
          className="inline-flex items-center justify-center rounded-lg bg-[var(--brand-gold)] px-4 py-2.5 text-sm font-semibold text-black transition hover:opacity-90"
        >
          Invite Staff
        </button>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-white/10 bg-white/5">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead>
            <tr className="border-b border-white/10 text-xs uppercase tracking-wide text-white/50">
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium">Email</th>
              <th className="px-4 py-3 font-medium">Role</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {staff.map((member) => (
              <tr key={member.email} className="transition hover:bg-white/5">
                <td className="px-4 py-3 font-medium text-white/80">{member.name}</td>
                <td className="px-4 py-3 text-white/60">{member.email}</td>
                <td className="px-4 py-3 text-white/60">{member.role}</td>
                <td className="px-4 py-3">
                  <StatusBadge status={member.status} />
                </td>
                <td className="px-4 py-3 text-right">
                  <button
                    type="button"
                    onClick={() => toggleStatus(member.email)}
                    className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-white/80 transition hover:bg-white/10"
                  >
                    {member.status === "active" ? "Disable" : "Enable"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
