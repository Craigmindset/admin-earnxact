"use client";

import { useState } from "react";
import { CURRENCY_SYMBOL } from "@/lib/currency";

type MissionStatus = "active" | "ended";

type Mission = {
  title: string;
  reward: number;
  participants: number;
  status: MissionStatus;
};

// Backend integration point:
// - Replace with real mission data from your admin API.
const INITIAL_MISSIONS: Mission[] = [
  { title: "Daily Survey Blitz", reward: 500, participants: 1240, status: "active" },
  { title: "Refer 5 Friends Challenge", reward: 5000, participants: 320, status: "active" },
  { title: "Watch 20 Ads Streak", reward: 1000, participants: 890, status: "active" },
  { title: "Weekend Task Sprint", reward: 2500, participants: 610, status: "ended" },
  { title: "New Year Kickoff Bonus", reward: 10000, participants: 2050, status: "ended" }
];

function StatusBadge({ status }: { status: MissionStatus }) {
  return (
    <span
      className={`rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide ${
        status === "active"
          ? "bg-emerald-500/10 text-emerald-400"
          : "bg-white/10 text-white/50"
      }`}
    >
      {status}
    </span>
  );
}

export default function MissionPage() {
  const [missions, setMissions] = useState(INITIAL_MISSIONS);

  function toggleStatus(title: string) {
    setMissions((current) =>
      current.map((mission) =>
        mission.title === title
          ? { ...mission, status: mission.status === "active" ? "ended" : "active" }
          : mission
      )
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white md:text-3xl">Mission</h1>
        <p className="mt-1 text-sm text-white/50">
          Create and manage earning missions available to users.
        </p>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-white/10 bg-white/5">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead>
            <tr className="border-b border-white/10 text-xs uppercase tracking-wide text-white/50">
              <th className="px-4 py-3 font-medium">Mission</th>
              <th className="px-4 py-3 font-medium">Reward</th>
              <th className="px-4 py-3 font-medium">Participants</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {missions.map((mission) => (
              <tr key={mission.title} className="transition hover:bg-white/5">
                <td className="px-4 py-3 font-medium text-white/80">{mission.title}</td>
                <td className="px-4 py-3 text-[var(--brand-gold)]">
                  {CURRENCY_SYMBOL}
                  {mission.reward.toLocaleString()}
                </td>
                <td className="px-4 py-3 text-white/60">
                  {mission.participants.toLocaleString()}
                </td>
                <td className="px-4 py-3">
                  <StatusBadge status={mission.status} />
                </td>
                <td className="px-4 py-3 text-right">
                  <button
                    type="button"
                    onClick={() => toggleStatus(mission.title)}
                    className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-white/80 transition hover:bg-white/10"
                  >
                    {mission.status === "active" ? "End Mission" : "Reactivate"}
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
