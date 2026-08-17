import type { IconType } from "react-icons";
import {
  MdAddTask,
  MdAssignment,
  MdCardMembership,
  MdGroups,
  MdHome,
  MdManageAccounts,
  MdMoneyOff,
  MdNotificationsNone,
  MdOndemandVideo,
  MdOutlinePayments,
  MdReceiptLong,
  MdSettings
} from "react-icons/md";

export type AdminNavItem = {
  label: string;
  href: string;
  icon: IconType;
  hot?: boolean;
};

export const ADMIN_NAV_ITEMS: AdminNavItem[] = [
  { label: "Overview", href: "/dashboard", icon: MdHome },
  { label: "Users", href: "/dashboard/users", icon: MdGroups },
  { label: "Create Task", href: "/dashboard/create-task", icon: MdAddTask },
  {
    label: "Task Submission",
    href: "/dashboard/task-submission",
    icon: MdAssignment,
    hot: true
  },
  {
    label: "Withdrawal Management",
    href: "/dashboard/withdrawal-management",
    icon: MdMoneyOff,
    hot: true
  },
  { label: "All Transactions", href: "/dashboard/transactions", icon: MdReceiptLong },
  { label: "Wallet", href: "/dashboard/wallet", icon: MdOutlinePayments },
  // { label: "Mission", href: "/dashboard/mission", icon: MdFlag },
  { label: "Earn Pass", href: "/dashboard/earn-pass", icon: MdCardMembership },
  { label: "Videos Management", href: "/dashboard/watch-ads-management", icon: MdOndemandVideo },
  { label: "Notification", href: "/dashboard/notification", icon: MdNotificationsNone },
  {
    label: "Account Management",
    href: "/dashboard/account-management",
    icon: MdManageAccounts
  },
  { label: "Account Setting", href: "/dashboard/account-setting", icon: MdSettings }
];

