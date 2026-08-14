// Minimal Supabase database types for admin-exact — only the shape needed
// for authenticating staff, checking the is_admin flag, and the admin-only
// RPCs this app calls. Extend this file as admin-exact grows real
// data-fetching pages (users, wallet, missions, etc.) — see
// earnxact/src/lib/database.types.ts for the full, canonical shape of every
// table in this shared Supabase project.

export type UserProfileRow = {
  user_id: string;
  first_name: string | null;
  last_name: string | null;
  email: string;
  wallet_balance: number;
  updated_at: string | null;
  /** True for staff accounts allowed to sign in to this admin app. */
  is_admin: boolean;
};

export type MembershipPlanRow = {
  id: string;
  name: string;
};

/** Row shape returned by the get_admin_users_list() RPC. */
export type AdminUserListRow = {
  user_id: string;
  first_name: string | null;
  last_name: string | null;
  email: string;
  phone_num: string | null;
  avatar_url: string | null;
  membership_plan_name: string | null;
  wallet_balance: number;
  joined_at: string;
  referrals_count: number;
  total_withdrawn: number;
};

/** jsonb shape returned by the get_admin_user_detail(p_user_id) RPC. */
export type AdminUserDetail = {
  user_id: string;
  first_name: string | null;
  last_name: string | null;
  email: string;
  phone_num: string | null;
  avatar_url: string | null;
  ip_address: string | null;
  wallet_balance: number;
  membership_plan_name: string;
  joined_at: string;
  total_withdrawn: number;
  last_withdrawal: { amount: number; status: string; created_at: string } | null;
  referrals: { user_id: string; first_name: string | null; last_name: string | null; email: string; joined_at: string }[];
  purchases: { reference: string; amount: number; description: string; created_at: string }[];
};

export type AdminWithdrawalRow = {
  request_id: string;
  user_id: string;
  first_name: string | null;
  last_name: string | null;
  email: string;
  bank_name: string;
  account_name: string;
  account_number: string;
  amount_withdrawn: number;
  created_at: string;
  status: "processing" | "completed" | "paid";
};

export type AdminStaffMember = {
  user_id: string;
  first_name: string | null;
  last_name: string | null;
  email: string;
  is_admin: boolean;
  created_at: string;
};

/** Row shape returned by the get_admin_daily_task_templates() RPC. */
export type AdminDailyTaskTemplateRow = {
  id: string;
  /** ISO weekday, 1 (Monday) through 5 (Friday). */
  weekday: number;
  title: string;
  description: string;
  reward: number;
  /** Optional link the user should visit to complete the task, e.g. a form or offer page. */
  url: string | null;
  is_active: boolean;
  membership_plan_id: string;
  membership_name: string;
  created_at: string;
};

/** Row shape returned by the get_admin_transactions() RPC. */
export type AdminTransactionRow = {
  id: string;
  user_id: string;
  first_name: string | null;
  last_name: string | null;
  email: string;
  type: "credit" | "debit" | "withdrawal" | "bonus";
  amount: number;
  status: "pending" | "completed" | "failed";
  reference: string | null;
  description: string | null;
  created_at: string;
};

export type Database = {
  public: {
    Tables: {
      user_profile: {
        Row: UserProfileRow;
        Insert: Partial<UserProfileRow> & { user_id: string; email: string };
        Update: Partial<UserProfileRow>;
        Relationships: [];
      };
      membership_plans: {
        Row: MembershipPlanRow;
        Insert: never;
        Update: never;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      get_admin_dashboard_stats: {
        Args: Record<string, never>;
        Returns: {
          total_users: number;
          total_pay_in: number;
          total_payout: number;
          pending_withdrawals: number;
          admin_balance: number;
        }[];
      };
      admin_send_notification: {
        Args: {
          p_title: string;
          p_message: string;
          p_target_type: string;
          p_membership_plan_id?: string | null;
          p_target_email?: string | null;
        };
        Returns: number;
      };
      get_admin_users_list: {
        Args: Record<string, never>;
        Returns: AdminUserListRow[];
      };
      get_admin_user_detail: {
        Args: { p_user_id: string };
        Returns: AdminUserDetail;
      };
      get_admin_withdrawal_requests: {
        Args: { p_status?: string | null };
        Returns: AdminWithdrawalRow[];
      };
      update_admin_withdrawal_status: {
        Args: { p_request_id: string; p_status: string };
        Returns: void;
      };
      get_admin_staff_list: {
        Args: Record<string, never>;
        Returns: AdminStaffMember[];
      };
      admin_invite_user_to_admin: {
        Args: { p_email: string };
        Returns: void;
      };
      admin_upsert_daily_task_template: {
        Args: {
          p_membership_plan_id: string;
          p_weekday: number;
          p_title: string;
          p_description: string;
          p_reward: number;
          p_url?: string | null;
          p_is_active?: boolean;
        };
        Returns: string;
      };
      get_admin_daily_task_templates: {
        Args: { p_membership_plan_id?: string | null };
        Returns: AdminDailyTaskTemplateRow[];
      };
      get_admin_transactions: {
        Args: {
          p_name?: string | null;
          p_email?: string | null;
          p_amount?: number | null;
        };
        Returns: AdminTransactionRow[];
      };
      get_admin_signup_trend: {
        Args: Record<string, never>;
        Returns: { period: string; user_count: number }[];
      };
      get_admin_plan_distribution: {
        Args: Record<string, never>;
        Returns: { plan_name: string; user_count: number }[];
      };
      get_admin_top_amounts: {
        Args: Record<string, never>;
        Returns: { label: string; amount: number }[];
      };
    };
    Enums: Record<string, never>;
  };
};

