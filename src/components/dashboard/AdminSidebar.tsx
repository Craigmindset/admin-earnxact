"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { MdChevronLeft, MdChevronRight } from "react-icons/md";
import { FiX } from "react-icons/fi";
import { ADMIN_NAV_ITEMS } from "@/components/dashboard/nav-data";

type AdminSidebarProps = {
  collapsed: boolean;
  onToggleCollapse: () => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
};

export default function AdminSidebar({
  collapsed,
  onToggleCollapse,
  mobileOpen,
  onCloseMobile
}: AdminSidebarProps) {
  const pathname = usePathname();

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-40 flex w-72 flex-col border-r border-white/10 bg-[var(--brand-card-1)] transition-transform duration-300 ease-out md:static md:z-auto md:h-[calc(100vh-4rem)] md:translate-x-0 md:sticky md:top-16 md:bg-[var(--brand-card-1)]/70 md:backdrop-blur ${
        mobileOpen ? "translate-x-0" : "-translate-x-full"
      } ${collapsed ? "md:w-20" : "md:w-64"}`}
    >
      <div className="flex items-center justify-between gap-2 border-b border-white/10 p-4">
        {!collapsed && (
          <span className="text-sm font-semibold tracking-wide text-white">
            <span className="text-white">Earn</span>
            <span className="text-[var(--brand-gold)]">Xact</span>{" "}
            <span className="text-white/50">Admin</span>
          </span>
        )}

        <button
          type="button"
          onClick={onToggleCollapse}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          className="hidden h-8 w-8 items-center justify-center rounded-md border border-white/10 bg-white/5 text-white/70 transition hover:bg-white/10 hover:text-white md:inline-flex"
        >
          {collapsed ? (
            <MdChevronRight className="text-lg" />
          ) : (
            <MdChevronLeft className="text-lg" />
          )}
        </button>

        <button
          type="button"
          onClick={onCloseMobile}
          aria-label="Close menu"
          className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-white/10 bg-white/5 text-white/70 transition hover:bg-white/10 hover:text-white md:hidden"
        >
          <FiX className="text-lg" />
        </button>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto p-3">
        {ADMIN_NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onCloseMobile}
              title={collapsed ? item.label : undefined}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition ${
                collapsed ? "justify-center" : ""
              } ${
                active
                  ? "bg-[var(--brand-gold)]/10 font-semibold text-[var(--brand-gold)]"
                  : "text-white/70 hover:bg-white/5 hover:text-white"
              }`}
            >
              <Icon className="text-lg shrink-0" />
              {!collapsed && <span className="truncate">{item.label}</span>}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
