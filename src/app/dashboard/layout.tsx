import type { ReactNode } from "react";
import AdminShell from "@/components/dashboard/AdminShell";

export default function DashboardLayout({
  children
}: Readonly<{
  children: ReactNode;
}>) {
  return <AdminShell>{children}</AdminShell>;
}
