"use client";

import { useEffect, useState } from "react";
import {
  MdCheckCircle,
  MdClose,
  MdInfo,
  MdOpenInNew,
  MdPerson,
  MdRefresh
} from "react-icons/md";
import { CURRENCY_SYMBOL } from "@/lib/currency";
import { createClient } from "@/lib/supabase/client";

type TaskSubmission = {
  id: string;
  user_id: string;
  user_email: string;
  user_full_name: string;
  daily_task_template_id: string;
  task_title: string;
  task_description: string;
  task_reward: number;
  membership_plan_name: string;
  screenshot_url: string;
  status: string;
  submitted_at: string;
  reviewed_at: string | null;
  reviewed_by: string | null;
};

const REFRESH_INTERVAL_MS = 15_000;

export default function TaskSubmissionPage() {
  const [submissions, setSubmissions] = useState<TaskSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [approving, setApproving] = useState<string | null>(null);
  const [approvingAll, setApprovingAll] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [showApproveAllTooltip, setShowApproveAllTooltip] = useState(false);

  const supabase = createClient();

  async function loadSubmissions() {
    const { data, error: err } = await supabase.rpc("get_admin_task_submissions", {
      p_status: "pending"
    });

    if (err) {
      setError(err.message);
      setLoading(false);
      return;
    }

    setSubmissions((data as TaskSubmission[]) ?? []);
    setError(null);
    setLoading(false);
  }

  async function approveSubmission(submissionId: string) {
    setApproving(submissionId);
    const { error: err } = await supabase.rpc("admin_approve_task_submission", {
      p_submission_id: submissionId
    });

    if (err) {
      alert(`Failed to approve: ${err.message}`);
      setApproving(null);
      return;
    }

    // Reload submissions
    await loadSubmissions();
    setApproving(null);
  }

  async function approveAll() {
    if (!confirm(`Approve all ${submissions.length} pending submissions without vetting?`)) {
      return;
    }

    setApprovingAll(true);
    const { data, error: err } = await supabase.rpc("admin_approve_all_task_submissions");

    if (err) {
      alert(`Failed to approve all: ${err.message}`);
      setApprovingAll(false);
      return;
    }

    const result = data as { approved_count: number; total_rewarded: number };
    alert(
      `✅ Approved ${result.approved_count} submissions\n💰 Total rewarded: ${CURRENCY_SYMBOL}${result.total_rewarded.toLocaleString()}`
    );

    await loadSubmissions();
    setApprovingAll(false);
  }

  useEffect(() => {
    loadSubmissions();
    const interval = setInterval(loadSubmissions, REFRESH_INTERVAL_MS);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-white/50">Loading submissions...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white md:text-3xl">Task Submission</h1>
          <p className="mt-1 text-sm text-white/50">
            Review and approve user task submissions
          </p>
        </div>

        <div className="flex items-center gap-3">
          {submissions.length > 0 && (
            <div className="relative">
              <button
                onClick={approveAll}
                disabled={approvingAll}
                className="flex items-center gap-2 rounded-xl bg-emerald-500/20 px-4 py-2.5 text-sm font-semibold text-emerald-400 transition hover:bg-emerald-500/30 disabled:opacity-50"
                onMouseEnter={() => setShowApproveAllTooltip(true)}
                onMouseLeave={() => setShowApproveAllTooltip(false)}
              >
                <MdCheckCircle className="text-base" />
                {approvingAll ? "Approving..." : "Approve All"}
              </button>

              {showApproveAllTooltip && (
                <div className="absolute right-0 top-full z-10 mt-2 w-64 rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-200">
                  <div className="flex items-start gap-2">
                    <MdInfo className="mt-0.5 shrink-0 text-sm text-amber-400" />
                    <div>
                      <strong className="font-semibold">Warning:</strong> This will approve all{" "}
                      {submissions.length} pending submissions without individual vetting.
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          <button
            onClick={loadSubmissions}
            className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-semibold text-white/80 transition hover:bg-white/10"
          >
            <MdRefresh className="text-base" />
            Refresh
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {error}
        </div>
      )}

      {/* Submissions Grid */}
      {submissions.length === 0 ? (
        <div className="flex min-h-[300px] items-center justify-center rounded-2xl border border-white/10 bg-white/5">
          <div className="text-center">
            <MdCheckCircle className="mx-auto text-5xl text-white/20" />
            <p className="mt-3 text-sm font-medium text-white/50">No pending submissions</p>
            <p className="mt-1 text-xs text-white/30">All caught up!</p>
          </div>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {submissions.map((submission) => (
            <div
              key={submission.id}
              className="group rounded-2xl border border-white/10 bg-white/5 p-4 transition hover:border-white/20 hover:bg-white/[0.07]"
            >
              {/* Screenshot */}
              <div className="relative aspect-video overflow-hidden rounded-lg bg-black/30">
                <img
                  src={submission.screenshot_url}
                  alt="Task submission"
                  className="h-full w-full object-cover transition group-hover:scale-105"
                />
                <button
                  onClick={() => setSelectedImage(submission.screenshot_url)}
                  className="absolute right-2 top-2 rounded-lg bg-black/60 p-2 text-white/80 opacity-0 backdrop-blur-sm transition hover:bg-black/80 group-hover:opacity-100"
                >
                  <MdOpenInNew className="text-sm" />
                </button>
              </div>

              {/* Task Info */}
              <div className="mt-3 space-y-2">
                <div>
                  <h3 className="line-clamp-1 text-sm font-semibold text-white">
                    {submission.task_title}
                  </h3>
                  <p className="mt-0.5 line-clamp-2 text-xs text-white/50">
                    {submission.task_description}
                  </p>
                </div>

                <div className="flex items-center gap-2 text-xs">
                  <span className="rounded bg-sky-500/20 px-2 py-1 font-medium text-sky-400">
                    {submission.membership_plan_name}
                  </span>
                  <span className="font-semibold text-emerald-400">
                    {CURRENCY_SYMBOL}
                    {Number(submission.task_reward).toLocaleString()}
                  </span>
                </div>

                {/* User Info */}
                <div className="flex items-center gap-2 rounded-lg border border-white/10 bg-black/20 px-3 py-2">
                  <MdPerson className="text-sm text-white/40" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-medium text-white/70">
                      {submission.user_full_name || "Unknown User"}
                    </p>
                    <p className="truncate text-[10px] text-white/40">
                      {submission.user_email}
                    </p>
                  </div>
                </div>

                {/* Submission Date */}
                <p className="text-[10px] text-white/40">
                  Submitted {new Date(submission.submitted_at).toLocaleString()}
                </p>

                {/* Approve Button */}
                <button
                  onClick={() => approveSubmission(submission.id)}
                  disabled={approving === submission.id}
                  className="mt-2 flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-500/20 px-4 py-2.5 text-sm font-semibold text-emerald-400 transition hover:bg-emerald-500/30 disabled:opacity-50"
                >
                  <MdCheckCircle className="text-base" />
                  {approving === submission.id ? "Approving..." : "Approve"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Image Modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
          onClick={() => setSelectedImage(null)}
        >
          <button
            onClick={() => setSelectedImage(null)}
            className="absolute right-4 top-4 rounded-lg bg-white/10 p-3 text-white transition hover:bg-white/20"
          >
            <MdClose className="text-xl" />
          </button>
          <img
            src={selectedImage}
            alt="Full size screenshot"
            className="max-h-full max-w-full rounded-lg"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}
