"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { MdAdminPanelSettings, MdLogout, MdNotificationsNone } from "react-icons/md";
import { FiMenu } from "react-icons/fi";

type AdminHeaderProps = {
  onToggleMobileSidebar: () => void;
};

export default function AdminHeader({ onToggleMobileSidebar }: AdminHeaderProps) {
  const router = useRouter();

  return (
    <header className="sticky top-0 z-50 flex h-16 items-center gap-3 border-b border-white/10 bg-[var(--brand-black)]/90 px-4 backdrop-blur supports-[backdrop-filter]:bg-[color:rgba(5,5,5,0.8)] md:px-6">
      <button
        type="button"
        onClick={onToggleMobileSidebar}
        aria-label="Open menu"
        className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-white transition hover:bg-white/10 md:hidden"
      >
        <FiMenu className="text-xl" />
      </button>

      <Link href="/dashboard" className="inline-flex items-center gap-2" aria-label="EarnXact Admin">
        <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--brand-gold)]/15 text-[var(--brand-gold)]">
          <MdAdminPanelSettings className="text-lg" />
        </span>
        <span className="hidden text-sm font-semibold tracking-wide text-white sm:inline">
          <span className="text-white">Earn</span>
          <span className="text-[var(--brand-gold)]">Xact</span>{" "}
          <span className="text-white/50">Admin</span>
        </span>
      </Link>

      <div className="ml-auto flex items-center gap-2 sm:gap-3">
        <button
          type="button"
          aria-label="Notifications"
          className="relative inline-flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-white/80 transition hover:bg-white/10 hover:text-white"
        >
          <MdNotificationsNone className="text-lg" />
          <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-[var(--brand-gold)]" />
        </button>

        <Link
          href="/dashboard/account-setting"
          aria-label="Account setting"
          className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-[var(--brand-gold)]/20 text-sm font-semibold text-[var(--brand-gold)] transition hover:bg-[var(--brand-gold)]/30"
        >
          A
        </Link>

        <button
          type="button"
          onClick={() => router.push("/login")}
          aria-label="Log out"
          className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-white/80 transition hover:bg-white/10 hover:text-white"
        >
          <MdLogout className="text-lg" />
        </button>
      </div>
    </header>
  );
}
