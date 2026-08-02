"use client";

import { useState } from "react";
import { MdSearch } from "react-icons/md";

type UserStatus = "active" | "suspended";

// Backend integration point:
// - Replace with real paginated user data from your admin API.
const USERS: { name: string; email: string; taskClass: string; status: UserStatus; joined: string }[] = [
  { name: "Grinder Jane", email: "jane@example.com", taskClass: "Executive", status: "active", joined: "2026-01-14" },
  { name: "Cash King", email: "cashking@example.com", taskClass: "Senior Executive", status: "active", joined: "2025-11-02" },
  { name: "Task Master", email: "taskmaster99@example.com", taskClass: "Mid Executive", status: "active", joined: "2025-12-20" },
  { name: "Daily Grind", email: "dailygrind@example.com", taskClass: "Junior Manager", status: "suspended", joined: "2026-02-01" },
  { name: "Quick Cash", email: "quickcash01@example.com", taskClass: "Team Class", status: "active", joined: "2026-03-11" },
  { name: "Steady Earns", email: "steadyearns@example.com", taskClass: "Team Class", status: "active", joined: "2026-04-05" }
];

function StatusBadge({ status }: { status: UserStatus }) {
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

export default function UsersPage() {
  const [query, setQuery] = useState("");

  const filteredUsers = USERS.filter((user) =>
    `${user.name} ${user.email}`.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white md:text-3xl">Users</h1>
        <p className="mt-1 text-sm text-white/50">
          Manage registered users, their task class and account status.
        </p>
      </div>

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
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead>
            <tr className="border-b border-white/10 text-xs uppercase tracking-wide text-white/50">
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium">Email</th>
              <th className="px-4 py-3 font-medium">Task Class</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Joined</th>
              <th className="px-4 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {filteredUsers.map((user) => (
              <tr key={user.email} className="transition hover:bg-white/5">
                <td className="px-4 py-3 font-medium text-white/80">{user.name}</td>
                <td className="px-4 py-3 text-white/60">{user.email}</td>
                <td className="px-4 py-3 text-white/60">{user.taskClass}</td>
                <td className="px-4 py-3">
                  <StatusBadge status={user.status} />
                </td>
                <td className="px-4 py-3 text-white/60">{user.joined}</td>
                <td className="px-4 py-3 text-right">
                  <button
                    type="button"
                    className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-white/80 transition hover:bg-white/10"
                  >
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
    </div>
  );
}
