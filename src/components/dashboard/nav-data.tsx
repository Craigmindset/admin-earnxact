import type { IconType } from "react-icons";
import {
  MdAddTask,
  MdCardMembership,
  MdFlag,
  MdGroups,
  MdHome,
  MdManageAccounts,
  MdMoneyOff,
  MdNotificationsNone,
  MdOutlinePayments,
  MdReceiptLong,
  MdSettings
} from "react-icons/md";

export type AdminNavItem = {
  label: string;
  href: string;
  icon: IconType;
};

export const ADMIN_NAV_ITEMS: AdminNavItem[] = [
  { label: "Overview", href: "/dashboard", icon: MdHome },
  { label: "Users", href: "/dashboard/users", icon: MdGroups },
  { label: "Earn Pass", href: "/dashboard/earn-pass", icon: MdCardMembership },
  { label: "Mission", href: "/dashboard/mission", icon: MdFlag },
  { label: "Create Task", href: "/dashboard/create-task", icon: MdAddTask },
  {
    label: "Account Management",
    href: "/dashboard/account-management",
    icon: MdManageAccounts
  },
  { label: "Wallet", href: "/dashboard/wallet", icon: MdOutlinePayments },
  {
    label: "Withdrawal Management",
    href: "/dashboard/withdrawal-management",
    icon: MdMoneyOff
  },
  { label: "All Transactions", href: "/dashboard/transactions", icon: MdReceiptLong },
  { label: "Notification", href: "/dashboard/notification", icon: MdNotificationsNone },
  { label: "Account Setting", href: "/dashboard/account-setting", icon: MdSettings }
];

