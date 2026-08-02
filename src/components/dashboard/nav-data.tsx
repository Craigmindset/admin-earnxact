import type { IconType } from "react-icons";
import {
  MdCardMembership,
  MdFlag,
  MdGroups,
  MdHome,
  MdManageAccounts,
  MdOutlinePayments,
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
  {
    label: "Account Management",
    href: "/dashboard/account-management",
    icon: MdManageAccounts
  },
  { label: "Wallet", href: "/dashboard/wallet", icon: MdOutlinePayments },
  { label: "Account Setting", href: "/dashboard/account-setting", icon: MdSettings }
];
