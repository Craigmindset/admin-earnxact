"use client";

import { useState } from "react";
import type { IconType } from "react-icons";
import {
  MdBusinessCenter,
  MdEmojiEvents,
  MdGroups,
  MdLocationOff,
  MdMilitaryTech,
  MdRocketLaunch,
  MdSupervisorAccount,
  MdWorkspacePremium
} from "react-icons/md";
import { CURRENCY_SYMBOL } from "@/lib/currency";

type TaskClass = {
  id: string;
  name: string;
  amount: number | null;
  description: string;
  available: boolean;
  icon: IconType;
};

// Backend integration point:
// - Replace with the real task class / EarnPass tier configuration from your API.
const INITIAL_TASK_CLASSES: TaskClass[] = [
  { id: "team-class", name: "Team Class", amount: 10000, description: "Great for beginners starting their earning journey.", available: true, icon: MdGroups },
  { id: "upscale-class", name: "Upscale Class", amount: 20000, description: "Step up your earnings with more task variety.", available: true, icon: MdRocketLaunch },
  { id: "superior-class", name: "Supervisor Class", amount: 50000, description: "Access more tasks with improved payout rates.", available: true, icon: MdMilitaryTech },
  { id: "junior-manager", name: "Junior Manager", amount: 100000, description: "Manage entry-level task teams for higher rewards.", available: true, icon: MdSupervisorAccount },
  { id: "mid-executive", name: "Mid Executive", amount: 200000, description: "Handle bigger task volumes with premium bonuses.", available: true, icon: MdBusinessCenter },
  { id: "executive", name: "Executive", amount: 300000, description: "Enjoy top-tier tasks with priority payouts.", available: true, icon: MdWorkspacePremium },
  { id: "senior-executive", name: "Senior Executive", amount: 500000, description: "Maximum task access at the highest reward tier.", available: true, icon: MdEmojiEvents },
  { id: "regional-manager", name: "Regional Manager", amount: null, description: "Not available in your country", available: false, icon: MdLocationOff }
];

export default function EarnPassPage() {
  const [taskClasses, setTaskClasses] = useState(INITIAL_TASK_CLASSES);

  function toggleAvailability(id: string) {
    setTaskClasses((current) =>
      current.map((taskClass) =>
        taskClass.id === id ? { ...taskClass, available: !taskClass.available } : taskClass
      )
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white md:text-3xl">Earn Pass</h1>
        <p className="mt-1 text-sm text-white/50">
          Manage the task class tiers available to users on the platform.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {taskClasses.map((taskClass) => {
          const Icon = taskClass.icon;
          return (
            <div
              key={taskClass.id}
              className="flex flex-col rounded-2xl border border-white/10 bg-white/5 p-5"
            >
              <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[var(--brand-gold)]/15 text-[var(--brand-gold)]">
                  <Icon className="text-xl" />
                </span>
                <div>
                  <div className="text-sm font-semibold text-white">{taskClass.name}</div>
                  <div className="text-xs text-white/50">
                    {taskClass.amount !== null
                      ? `${CURRENCY_SYMBOL}${taskClass.amount.toLocaleString()}`
                      : "Unavailable"}
                  </div>
                </div>
              </div>

              <p className="mt-3 flex-1 text-xs leading-relaxed text-white/60">
                {taskClass.description}
              </p>

              <button
                type="button"
                onClick={() => toggleAvailability(taskClass.id)}
                className={`mt-4 rounded-lg px-4 py-2 text-xs font-semibold transition ${
                  taskClass.available
                    ? "bg-[var(--brand-gold)] text-black hover:opacity-90"
                    : "border border-white/10 bg-white/5 text-white/60 hover:bg-white/10"
                }`}
              >
                {taskClass.available ? "Available" : "Unavailable"}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
