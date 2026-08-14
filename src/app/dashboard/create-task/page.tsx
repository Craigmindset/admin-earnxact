"use client";

import { useEffect, useMemo, useState } from "react";
import { MdEdit, MdOpenInNew, MdSave } from "react-icons/md";
import { createClient } from "@/lib/supabase/client";
import { CURRENCY_SYMBOL } from "@/lib/currency";
import type { AdminDailyTaskTemplateRow, MembershipPlanRow } from "@/lib/database.types";

const WEEKDAY_LABELS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

// Africa/Lagos (Nigeria) is UTC+1 year-round - a fixed offset is accurate
// (no timezone library needed). Used to figure out which weekday counts as
// "today"/"tomorrow" for the View & Edit Tasks section below.
const NIGERIA_OFFSET_MS = 60 * 60 * 1000;

function getNigeriaIsoWeekday(offsetDays = 0) {
  const now = new Date(Date.now() + NIGERIA_OFFSET_MS + offsetDays * 24 * 60 * 60 * 1000);
  const day = now.getUTCDay();
  return day === 0 ? 7 : day;
}

type DayForm = {
  title: string;
  description: string;
  reward: string;
  url: string;
};

function emptyDay(): DayForm {
  return { title: "", description: "", reward: "", url: "" };
}

export default function CreateTaskPage() {
  const [plans, setPlans] = useState<MembershipPlanRow[]>([]);
  const [selectedPlanId, setSelectedPlanId] = useState<string>("");
  const [dayCount, setDayCount] = useState(1);
  const [days, setDays] = useState<DayForm[]>([emptyDay()]);
  const [existingTemplates, setExistingTemplates] = useState<AdminDailyTaskTemplateRow[]>([]);
  const [loadingPlans, setLoadingPlans] = useState(true);
  const [loadingTemplates, setLoadingTemplates] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [scope, setScope] = useState<"today" | "tomorrow" | "week">("today");
  const [editingWeekday, setEditingWeekday] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<DayForm>(emptyDay());
  const [isSavingEdit, setIsSavingEdit] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);
  const [editSuccess, setEditSuccess] = useState<string | null>(null);

  async function reloadTemplates(planId: string) {
    setLoadingTemplates(true);
    const supabase = createClient();
    const { data, error } = await supabase.rpc("get_admin_daily_task_templates", {
      p_membership_plan_id: planId
    });

    if (error) {
      setErrorMessage(error.message);
      setLoadingTemplates(false);
      return;
    }

    setExistingTemplates((data ?? []) as AdminDailyTaskTemplateRow[]);
    setErrorMessage(null);
    setLoadingTemplates(false);
  }

  useEffect(() => {
    async function loadPlans() {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("membership_plans")
        .select("id, name")
        .order("name", { ascending: true });

      if (error) {
        setErrorMessage(error.message);
        setLoadingPlans(false);
        return;
      }

      const rows = (data ?? []) as MembershipPlanRow[];
      setPlans(rows);
      setSelectedPlanId(rows[0]?.id ?? "");
      setLoadingPlans(false);
    }

    loadPlans();
  }, []);

  useEffect(() => {
    if (!selectedPlanId) return;
    reloadTemplates(selectedPlanId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedPlanId]);

  // Prefill day inputs from the plan's existing task set whenever the plan
  // or the number of days changes, so editing an existing task doesn't
  // require retyping everything.
  useEffect(() => {
    setDays((current) => {
      const next: DayForm[] = [];
      for (let i = 0; i < dayCount; i++) {
        const weekday = i + 1;
        const existing = existingTemplates.find((t) => t.weekday === weekday);
        next.push(
          existing
            ? {
                title: existing.title,
                description: existing.description,
                reward: String(existing.reward),
                url: existing.url ?? ""
              }
            : current[i] ?? emptyDay()
        );
      }
      return next;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [existingTemplates, dayCount]);

  const selectedPlanName = useMemo(
    () => plans.find((plan) => plan.id === selectedPlanId)?.name ?? "",
    [plans, selectedPlanId]
  );

  // Which weekday(s) the View & Edit Tasks section below should show for the
  // current scope. "today"/"tomorrow" resolve to a single Nigeria-calendar
  // weekday (empty on a weekend, since no tasks exist for Sat/Sun); "week"
  // always shows all 5 configured days.
  const visibleWeekdays = useMemo(() => {
    if (scope === "week") return [1, 2, 3, 4, 5];
    const iso = getNigeriaIsoWeekday(scope === "tomorrow" ? 1 : 0);
    return iso >= 1 && iso <= 5 ? [iso] : [];
  }, [scope]);

  function updateDay(index: number, field: keyof DayForm, value: string) {
    setDays((current) =>
      current.map((day, i) => (i === index ? { ...day, [field]: value } : day))
    );
  }

  function startEdit(weekday: number, template: AdminDailyTaskTemplateRow) {
    setEditingWeekday(weekday);
    setEditForm({
      title: template.title,
      description: template.description,
      reward: String(template.reward),
      url: template.url ?? ""
    });
    setEditError(null);
    setEditSuccess(null);
  }

  function cancelEdit() {
    setEditingWeekday(null);
    setEditForm(emptyDay());
    setEditError(null);
  }

  async function saveEdit(weekday: number) {
    if (!editForm.title.trim() || !editForm.description.trim() || editForm.reward.trim() === "") {
      setEditError("Fill in title, description and reward before saving.");
      return;
    }
    if (Number.isNaN(Number(editForm.reward)) || Number(editForm.reward) < 0) {
      setEditError("Reward must be a valid non-negative number.");
      return;
    }

    setIsSavingEdit(true);
    setEditError(null);

    const supabase = createClient();
    const { error } = await supabase.rpc("admin_upsert_daily_task_template", {
      p_membership_plan_id: selectedPlanId,
      p_weekday: weekday,
      p_title: editForm.title.trim(),
      p_description: editForm.description.trim(),
      p_reward: Number(editForm.reward),
      p_url: editForm.url.trim() || null,
      p_is_active: true
    });

    if (error) {
      setEditError(error.message);
      setIsSavingEdit(false);
      return;
    }

    await reloadTemplates(selectedPlanId);
    setEditSuccess(`${WEEKDAY_LABELS[weekday - 1]} task updated.`);
    setEditingWeekday(null);
    setIsSavingEdit(false);
  }

  async function handleSubmit() {
    if (!selectedPlanId) {
      setErrorMessage("Select a membership plan first.");
      return;
    }

    for (let i = 0; i < days.length; i++) {
      const day = days[i];
      if (!day.title.trim() || !day.description.trim() || day.reward.trim() === "") {
        setErrorMessage(`Fill in title, description and reward for Day ${i + 1} (${WEEKDAY_LABELS[i]}).`);
        return;
      }
      if (Number.isNaN(Number(day.reward)) || Number(day.reward) < 0) {
        setErrorMessage(`Reward for Day ${i + 1} (${WEEKDAY_LABELS[i]}) must be a valid non-negative number.`);
        return;
      }
    }

    setErrorMessage(null);
    setSuccessMessage(null);
    setIsSubmitting(true);

    const supabase = createClient();

    for (let i = 0; i < days.length; i++) {
      const day = days[i];
      const { error } = await supabase.rpc("admin_upsert_daily_task_template", {
        p_membership_plan_id: selectedPlanId,
        p_weekday: i + 1,
        p_title: day.title.trim(),
        p_description: day.description.trim(),
        p_reward: Number(day.reward),
        p_url: day.url.trim() || null,
        p_is_active: true
      });

      if (error) {
        setErrorMessage(`Day ${i + 1} (${WEEKDAY_LABELS[i]}): ${error.message}`);
        setIsSubmitting(false);
        return;
      }
    }

    await reloadTemplates(selectedPlanId);

    setSuccessMessage(
      `Saved ${days.length} day${days.length === 1 ? "" : "s"} of tasks for ${selectedPlanName}. Users on this plan will see the update instantly.`
    );
    setIsSubmitting(false);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white md:text-3xl">Create Task</h1>
        <p className="mt-1 text-sm text-white/50">
          Author the Mon-Fri daily task set for a membership plan (1 to 5 days). Saved tasks
          update the plan&apos;s users in real time — no deploy or refresh needed.
        </p>
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/5 p-5 md:p-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="text-xs font-medium text-white/60">Membership plan</label>
            <select
              value={selectedPlanId}
              onChange={(event) => setSelectedPlanId(event.target.value)}
              disabled={loadingPlans}
              className="mt-1.5 w-full rounded-lg border border-white/10 bg-black/20 px-3 py-2.5 text-sm text-white outline-none focus:border-[var(--brand-gold)]"
            >
              {plans.map((plan) => (
                <option key={plan.id} value={plan.id} className="bg-black">
                  {plan.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-medium text-white/60">Number of days (1-5)</label>
            <select
              value={dayCount}
              onChange={(event) => setDayCount(Number(event.target.value))}
              className="mt-1.5 w-full rounded-lg border border-white/10 bg-black/20 px-3 py-2.5 text-sm text-white outline-none focus:border-[var(--brand-gold)]"
            >
              {[1, 2, 3, 4, 5].map((count) => (
                <option key={count} value={count} className="bg-black">
                  {count} day{count === 1 ? "" : "s"}
                </option>
              ))}
            </select>
          </div>
        </div>

        {loadingTemplates && (
          <div className="mt-4 text-xs text-white/45">Loading existing tasks for this plan…</div>
        )}

        <div className="mt-5 space-y-4">
          {days.map((day, index) => (
            <div key={index} className="rounded-xl border border-white/10 bg-black/20 p-4">
              <div className="text-xs font-semibold uppercase tracking-wide text-[var(--brand-gold)]">
                Day {index + 1} — {WEEKDAY_LABELS[index]}
              </div>

              <div className="mt-3 grid gap-3 sm:grid-cols-3">
                <div className="sm:col-span-2">
                  <label className="text-xs font-medium text-white/60">Title</label>
                  <input
                    type="text"
                    value={day.title}
                    onChange={(event) => updateDay(index, "title", event.target.value)}
                    className="mt-1.5 w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm text-white outline-none focus:border-[var(--brand-gold)]"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-white/60">Reward ({CURRENCY_SYMBOL})</label>
                  <input
                    type="number"
                    min={0}
                    step="0.01"
                    value={day.reward}
                    onChange={(event) => updateDay(index, "reward", event.target.value)}
                    className="mt-1.5 w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm text-white outline-none focus:border-[var(--brand-gold)]"
                  />
                </div>
              </div>

              <div className="mt-3">
                <label className="text-xs font-medium text-white/60">Description</label>
                <textarea
                  value={day.description}
                  onChange={(event) => updateDay(index, "description", event.target.value)}
                  rows={3}
                  className="mt-1.5 w-full resize-none rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm text-white outline-none focus:border-[var(--brand-gold)]"
                />
              </div>

              <div className="mt-3">
                <label className="text-xs font-medium text-white/60">Task URL (optional)</label>
                <input
                  type="url"
                  placeholder="https://…"
                  value={day.url}
                  onChange={(event) => updateDay(index, "url", event.target.value)}
                  className="mt-1.5 w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm text-white outline-none focus:border-[var(--brand-gold)]"
                />
                <p className="mt-1 text-[11px] text-white/40">
                  Shown to users as an &quot;Open link&quot; button on this day&apos;s task.
                </p>
              </div>
            </div>
          ))}
        </div>

        {errorMessage && (
          <div className="mt-4 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">
            {errorMessage}
          </div>
        )}

        {successMessage && (
          <div className="mt-4 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-300">
            {successMessage}
          </div>
        )}

        <button
          type="button"
          onClick={handleSubmit}
          disabled={isSubmitting || loadingPlans}
          className="mt-6 inline-flex items-center justify-center gap-2 rounded-lg bg-[var(--brand-gold)] px-4 py-2.5 text-sm font-semibold text-black transition hover:opacity-90 disabled:opacity-60"
        >
          <MdSave className="text-base" />
          {isSubmitting ? "Saving..." : "Save Tasks"}
        </button>
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/5 p-5 md:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-base font-semibold text-white">View &amp; Edit Tasks</h2>
            <p className="mt-1 text-sm text-white/50">
              Select a plan and a time range to review its current tasks, then edit and resave any day.
            </p>
          </div>

          <select
            value={selectedPlanId}
            onChange={(event) => setSelectedPlanId(event.target.value)}
            disabled={loadingPlans}
            className="w-full rounded-lg border border-white/10 bg-black/20 px-3 py-2.5 text-sm text-white outline-none focus:border-[var(--brand-gold)] sm:w-56"
          >
            {plans.map((plan) => (
              <option key={plan.id} value={plan.id} className="bg-black">
                {plan.name}
              </option>
            ))}
          </select>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {(["today", "tomorrow", "week"] as const).map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setScope(option)}
              className={`rounded-lg border px-3 py-2 text-xs font-semibold uppercase tracking-wide transition ${
                scope === option
                  ? "border-[var(--brand-gold)]/40 bg-[var(--brand-gold)]/15 text-[var(--brand-gold)]"
                  : "border-white/10 bg-black/20 text-white/60 hover:text-white"
              }`}
            >
              {option === "today" ? "Today" : option === "tomorrow" ? "Tomorrow" : "This Week"}
            </button>
          ))}
        </div>

        {loadingTemplates && (
          <div className="mt-4 text-xs text-white/45">Loading tasks…</div>
        )}

        {editError && (
          <div className="mt-4 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">
            {editError}
          </div>
        )}

        {editSuccess && (
          <div className="mt-4 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-300">
            {editSuccess}
          </div>
        )}

        <div className="mt-4 space-y-4">
          {!loadingTemplates && visibleWeekdays.length === 0 && (
            <div className="rounded-xl border border-white/10 bg-black/20 p-4 text-sm text-white/50">
              No task day falls on the weekend — check back on Monday, or switch to &quot;This Week&quot;.
            </div>
          )}

          {visibleWeekdays.map((weekday) => {
            const template = existingTemplates.find((t) => t.weekday === weekday);
            const isEditing = editingWeekday === weekday;

            return (
              <div key={weekday} className="rounded-xl border border-white/10 bg-black/20 p-4">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-semibold uppercase tracking-wide text-[var(--brand-gold)]">
                    {WEEKDAY_LABELS[weekday - 1]}
                  </div>

                  {template && !isEditing && (
                    <button
                      type="button"
                      onClick={() => startEdit(weekday, template)}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1.5 text-[11px] font-semibold text-white/80 transition hover:bg-white/10"
                    >
                      <MdEdit className="text-xs" />
                      Edit
                    </button>
                  )}
                </div>

                {!template && (
                  <p className="mt-2 text-sm text-white/50">
                    No task created yet for this day. Use the form above to add it.
                  </p>
                )}

                {template && !isEditing && (
                  <div className="mt-2 space-y-1">
                    <div className="text-sm font-medium text-white/85">{template.title}</div>
                    <p className="text-xs leading-relaxed text-white/60">{template.description}</p>
                    <div className="text-xs font-medium text-[var(--brand-gold)]">
                      Reward: {CURRENCY_SYMBOL}
                      {Number(template.reward).toLocaleString()}
                    </div>
                    {template.url && (
                      <a
                        href={template.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs font-medium text-white/60 underline decoration-white/30 underline-offset-2 hover:text-white"
                      >
                        <MdOpenInNew className="text-xs" />
                        {template.url}
                      </a>
                    )}
                  </div>
                )}

                {template && isEditing && (
                  <div className="mt-3 space-y-3">
                    <div className="grid gap-3 sm:grid-cols-3">
                      <div className="sm:col-span-2">
                        <label className="text-xs font-medium text-white/60">Title</label>
                        <input
                          type="text"
                          value={editForm.title}
                          onChange={(event) =>
                            setEditForm((current) => ({ ...current, title: event.target.value }))
                          }
                          className="mt-1.5 w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm text-white outline-none focus:border-[var(--brand-gold)]"
                        />
                      </div>

                      <div>
                        <label className="text-xs font-medium text-white/60">Reward ({CURRENCY_SYMBOL})</label>
                        <input
                          type="number"
                          min={0}
                          step="0.01"
                          value={editForm.reward}
                          onChange={(event) =>
                            setEditForm((current) => ({ ...current, reward: event.target.value }))
                          }
                          className="mt-1.5 w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm text-white outline-none focus:border-[var(--brand-gold)]"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-medium text-white/60">Description</label>
                      <textarea
                        value={editForm.description}
                        onChange={(event) =>
                          setEditForm((current) => ({ ...current, description: event.target.value }))
                        }
                        rows={3}
                        className="mt-1.5 w-full resize-none rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm text-white outline-none focus:border-[var(--brand-gold)]"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-medium text-white/60">Task URL (optional)</label>
                      <input
                        type="url"
                        placeholder="https://…"
                        value={editForm.url}
                        onChange={(event) =>
                          setEditForm((current) => ({ ...current, url: event.target.value }))
                        }
                        className="mt-1.5 w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm text-white outline-none focus:border-[var(--brand-gold)]"
                      />
                    </div>

                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={cancelEdit}
                        disabled={isSavingEdit}
                        className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-white/70 transition hover:bg-white/10 disabled:opacity-60"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={() => saveEdit(weekday)}
                        disabled={isSavingEdit}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-[var(--brand-gold)] px-3 py-1.5 text-xs font-semibold text-black transition hover:opacity-90 disabled:opacity-60"
                      >
                        <MdSave className="text-xs" />
                        {isSavingEdit ? "Saving..." : "Save"}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
