export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      anonymous_tailor_uses: {
        Row: {
          created_at: string
          device_hash: string
          id: string
          ip_hash: string | null
          updated_at: string
          used_count: number
        }
        Insert: {
          created_at?: string
          device_hash: string
          id?: string
          ip_hash?: string | null
          updated_at?: string
          used_count?: number
        }
        Update: {
          created_at?: string
          device_hash?: string
          id?: string
          ip_hash?: string | null
          updated_at?: string
          used_count?: number
        }
        Relationships: []
      }
      captured_emails: {
        Row: {
          created_at: string
          device_hash: string | null
          email: string
          id: string
          source: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          device_hash?: string | null
          email: string
          id?: string
          source?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          device_hash?: string | null
          email?: string
          id?: string
          source?: string
          updated_at?: string
        }
        Relationships: []
      }
      credit_topups: {
        Row: {
          amount: number
          created_at: string
          credits: number
          currency: string
          expires_at: string | null
          id: string
          kind: Database["public"]["Enums"]["topup_kind"]
          pack_id: string
          razorpay_order_id: string | null
          razorpay_payment_id: string | null
          remaining: number
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          credits: number
          currency: string
          expires_at?: string | null
          id?: string
          kind: Database["public"]["Enums"]["topup_kind"]
          pack_id: string
          razorpay_order_id?: string | null
          razorpay_payment_id?: string | null
          remaining?: number
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          credits?: number
          currency?: string
          expires_at?: string | null
          id?: string
          kind?: Database["public"]["Enums"]["topup_kind"]
          pack_id?: string
          razorpay_order_id?: string | null
          razorpay_payment_id?: string | null
          remaining?: number
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      job_alert_sent: {
        Row: {
          alert_id: string
          created_at: string
          id: string
          job_url: string
        }
        Insert: {
          alert_id: string
          created_at?: string
          id?: string
          job_url: string
        }
        Update: {
          alert_id?: string
          created_at?: string
          id?: string
          job_url?: string
        }
        Relationships: [
          {
            foreignKeyName: "job_alert_sent_alert_id_fkey"
            columns: ["alert_id"]
            isOneToOne: false
            referencedRelation: "job_alerts"
            referencedColumns: ["id"]
          },
        ]
      }
      job_alerts: {
        Row: {
          created_at: string
          enabled: boolean
          experience: string | null
          extra_filters: string | null
          id: string
          last_job_count: number
          last_jobs: Json | null
          last_sent_at: string | null
          local_hour: number
          location: string | null
          remote_only: boolean
          role: string
          salary_range: string | null
          send_hour_utc: number
          timezone: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          enabled?: boolean
          experience?: string | null
          extra_filters?: string | null
          id?: string
          last_job_count?: number
          last_jobs?: Json | null
          last_sent_at?: string | null
          local_hour?: number
          location?: string | null
          remote_only?: boolean
          role: string
          salary_range?: string | null
          send_hour_utc?: number
          timezone?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          enabled?: boolean
          experience?: string | null
          extra_filters?: string | null
          id?: string
          last_job_count?: number
          last_jobs?: Json | null
          last_sent_at?: string | null
          local_hour?: number
          location?: string | null
          remote_only?: boolean
          role?: string
          salary_range?: string | null
          send_hour_utc?: number
          timezone?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      job_applications: {
        Row: {
          applied_at: string | null
          company: string
          created_at: string
          id: string
          job_url: string | null
          location: string | null
          next_action_at: string | null
          notes: string | null
          role: string
          stage: string
          tailor_run_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          applied_at?: string | null
          company: string
          created_at?: string
          id?: string
          job_url?: string | null
          location?: string | null
          next_action_at?: string | null
          notes?: string | null
          role: string
          stage?: string
          tailor_run_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          applied_at?: string | null
          company?: string
          created_at?: string
          id?: string
          job_url?: string | null
          location?: string | null
          next_action_at?: string | null
          notes?: string | null
          role?: string
          stage?: string
          tailor_run_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "job_applications_tailor_run_id_fkey"
            columns: ["tailor_run_id"]
            isOneToOne: false
            referencedRelation: "tailor_runs"
            referencedColumns: ["id"]
          },
        ]
      }
      job_search_runs: {
        Row: {
          created_at: string
          id: string
          location: string | null
          role: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          location?: string | null
          role?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          location?: string | null
          role?: string | null
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          full_name: string | null
          id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          full_name?: string | null
          id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          full_name?: string | null
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      rate_limits: {
        Row: {
          bucket: string
          count: number
          created_at: string
          id: string
          identifier: string
          window_start: string
        }
        Insert: {
          bucket: string
          count?: number
          created_at?: string
          id?: string
          identifier: string
          window_start: string
        }
        Update: {
          bucket?: string
          count?: number
          created_at?: string
          id?: string
          identifier?: string
          window_start?: string
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          cancel_at_period_end: boolean | null
          created_at: string | null
          current_period_end: string | null
          current_period_start: string | null
          environment: string
          id: string
          price_id: string
          product_id: string
          status: string
          stripe_customer_id: string
          stripe_subscription_id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          cancel_at_period_end?: boolean | null
          created_at?: string | null
          current_period_end?: string | null
          current_period_start?: string | null
          environment?: string
          id?: string
          price_id: string
          product_id: string
          status?: string
          stripe_customer_id: string
          stripe_subscription_id: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          cancel_at_period_end?: boolean | null
          created_at?: string | null
          current_period_end?: string | null
          current_period_start?: string | null
          environment?: string
          id?: string
          price_id?: string
          product_id?: string
          status?: string
          stripe_customer_id?: string
          stripe_subscription_id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      tailor_runs: {
        Row: {
          company: string | null
          created_at: string
          id: string
          label: string | null
          match_score: number | null
          result: Json | null
          role: string | null
          user_id: string
        }
        Insert: {
          company?: string | null
          created_at?: string
          id?: string
          label?: string | null
          match_score?: number | null
          result?: Json | null
          role?: string | null
          user_id: string
        }
        Update: {
          company?: string | null
          created_at?: string
          id?: string
          label?: string | null
          match_score?: number | null
          result?: Json | null
          role?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      bump_rate_limit: {
        Args: { _bucket: string; _identifier: string; _window_start: string }
        Returns: number
      }
      consume_topup_credit: {
        Args: {
          _kind: Database["public"]["Enums"]["topup_kind"]
          _user_id: string
        }
        Returns: boolean
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      topup_balance: {
        Args: {
          _kind: Database["public"]["Enums"]["topup_kind"]
          _user_id: string
        }
        Returns: number
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
      topup_kind: "tailor" | "job_search" | "job_alert"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "moderator", "user"],
      topup_kind: ["tailor", "job_search", "job_alert"],
    },
  },
} as const
