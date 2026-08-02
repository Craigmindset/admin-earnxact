"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import { MdCheckCircle, MdLock, MdPerson } from "react-icons/md";

export default function AccountSettingPage() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordMessage, setPasswordMessage] = useState<
    { type: "success" | "error"; text: string } | null
  >(null);

  const [notifyWithdrawals, setNotifyWithdrawals] = useState(true);
  const [notifyNewUsers, setNotifyNewUsers] = useState(false);

  function handleChangePassword(event: FormEvent) {
    event.preventDefault();

    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordMessage({ type: "error", text: "Please fill in all password fields." });
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordMessage({ type: "error", text: "New passwords do not match." });
      return;
    }

    setPasswordMessage({ type: "success", text: "Your password has been updated successfully." });
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white md:text-3xl">Account Setting</h1>
        <p className="mt-1 text-sm text-white/50">
          Manage your admin profile, security and notification preferences.
        </p>
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/5 p-5 md:p-6">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full border border-white/15 bg-[var(--brand-gold)]/20 text-[var(--brand-gold)]">
            <MdPerson className="text-3xl" />
          </div>
          <div>
            <div className="text-sm font-semibold text-white">Admin User</div>
            <div className="text-xs text-white/50">Super Admin</div>
          </div>
        </div>
      </div>

      <form
        onSubmit={handleChangePassword}
        className="rounded-2xl border border-white/10 bg-white/5 p-5 md:p-6"
      >
        <div className="flex items-center gap-2">
          <MdLock className="text-lg text-[var(--brand-gold)]" />
          <h2 className="text-sm font-semibold uppercase tracking-wide text-white md:text-base">
            Change Password
          </h2>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <label className="text-xs font-medium text-white/60">Current Password</label>
            <input
              type="password"
              required
              value={currentPassword}
              onChange={(event) => {
                setCurrentPassword(event.target.value);
                setPasswordMessage(null);
              }}
              className="mt-1.5 w-full rounded-lg border border-white/10 bg-black/20 px-3 py-2.5 text-sm text-white outline-none focus:border-[var(--brand-gold)]"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-white/60">New Password</label>
            <input
              type="password"
              required
              value={newPassword}
              onChange={(event) => {
                setNewPassword(event.target.value);
                setPasswordMessage(null);
              }}
              className="mt-1.5 w-full rounded-lg border border-white/10 bg-black/20 px-3 py-2.5 text-sm text-white outline-none focus:border-[var(--brand-gold)]"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-white/60">
              Confirm New Password
            </label>
            <input
              type="password"
              required
              value={confirmPassword}
              onChange={(event) => {
                setConfirmPassword(event.target.value);
                setPasswordMessage(null);
              }}
              className="mt-1.5 w-full rounded-lg border border-white/10 bg-black/20 px-3 py-2.5 text-sm text-white outline-none focus:border-[var(--brand-gold)]"
            />
          </div>
        </div>

        {passwordMessage && (
          <div
            className={`mt-4 flex items-center gap-2 rounded-lg border px-3 py-2.5 text-xs ${
              passwordMessage.type === "success"
                ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
                : "border-red-500/30 bg-red-500/10 text-red-400"
            }`}
          >
            <MdCheckCircle className="shrink-0 text-sm" />
            {passwordMessage.text}
          </div>
        )}

        <button
          type="submit"
          className="mt-4 rounded-lg bg-[var(--brand-gold)] px-5 py-2.5 text-sm font-semibold text-black transition hover:opacity-90"
        >
          Update Password
        </button>
      </form>

      <div className="rounded-2xl border border-white/10 bg-white/5 p-5 md:p-6">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-white md:text-base">
          Notification Preferences
        </h2>

        <div className="mt-4 space-y-3">
          <label className="flex items-center justify-between gap-3 rounded-lg border border-white/10 bg-black/20 px-4 py-3">
            <span className="text-sm text-white/80">Withdrawal request alerts</span>
            <input
              type="checkbox"
              checked={notifyWithdrawals}
              onChange={(event) => setNotifyWithdrawals(event.target.checked)}
              className="h-4 w-4 accent-[var(--brand-gold)]"
            />
          </label>

          <label className="flex items-center justify-between gap-3 rounded-lg border border-white/10 bg-black/20 px-4 py-3">
            <span className="text-sm text-white/80">New user sign-up alerts</span>
            <input
              type="checkbox"
              checked={notifyNewUsers}
              onChange={(event) => setNotifyNewUsers(event.target.checked)}
              className="h-4 w-4 accent-[var(--brand-gold)]"
            />
          </label>
        </div>
      </div>
    </div>
  );
}
