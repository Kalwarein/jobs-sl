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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      admin_actions: {
        Row: {
          action_type: string
          admin_id: string
          created_at: string | null
          id: string
          metadata: Json | null
          reason: string | null
          target_id: string | null
          target_type: string
        }
        Insert: {
          action_type: string
          admin_id: string
          created_at?: string | null
          id?: string
          metadata?: Json | null
          reason?: string | null
          target_id?: string | null
          target_type: string
        }
        Update: {
          action_type?: string
          admin_id?: string
          created_at?: string | null
          id?: string
          metadata?: Json | null
          reason?: string | null
          target_id?: string | null
          target_type?: string
        }
        Relationships: []
      }
      announcements: {
        Row: {
          created_at: string | null
          created_by: string | null
          expires_at: string | null
          id: string
          is_active: boolean | null
          message: string
          title: string
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          message: string
          title: string
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          message?: string
          title?: string
        }
        Relationships: []
      }
      app_settings: {
        Row: {
          id: string
          key: string
          updated_at: string | null
          updated_by: string | null
          value: Json | null
        }
        Insert: {
          id?: string
          key: string
          updated_at?: string | null
          updated_by?: string | null
          value?: Json | null
        }
        Update: {
          id?: string
          key?: string
          updated_at?: string | null
          updated_by?: string | null
          value?: Json | null
        }
        Relationships: []
      }
      audit_logs: {
        Row: {
          action: string
          admin_email: string | null
          admin_id: string
          created_at: string | null
          details: Json | null
          entity_id: string | null
          entity_type: string
          id: string
        }
        Insert: {
          action: string
          admin_email?: string | null
          admin_id: string
          created_at?: string | null
          details?: Json | null
          entity_id?: string | null
          entity_type: string
          id?: string
        }
        Update: {
          action?: string
          admin_email?: string | null
          admin_id?: string
          created_at?: string | null
          details?: Json | null
          entity_id?: string | null
          entity_type?: string
          id?: string
        }
        Relationships: []
      }
      companies: {
        Row: {
          admin_notes: string | null
          approved_at: string | null
          approved_by: string | null
          business_type: string | null
          contact_email: string | null
          contact_person_id_type: string | null
          contact_person_name: string | null
          contact_phone: string | null
          created_at: string | null
          created_by: string
          date_of_incorporation: string | null
          description: string | null
          director_id_types: string[] | null
          director_names: string[] | null
          id: string
          industry: string | null
          is_approved: boolean | null
          is_suspended: boolean | null
          location: string | null
          logo_url: string | null
          name: string
          operating_address: string | null
          reason_for_joining: string | null
          registration_number: string | null
          tin_number: string | null
          trust_level: string | null
          updated_at: string | null
          verification_stage: string | null
          website: string | null
        }
        Insert: {
          admin_notes?: string | null
          approved_at?: string | null
          approved_by?: string | null
          business_type?: string | null
          contact_email?: string | null
          contact_person_id_type?: string | null
          contact_person_name?: string | null
          contact_phone?: string | null
          created_at?: string | null
          created_by: string
          date_of_incorporation?: string | null
          description?: string | null
          director_id_types?: string[] | null
          director_names?: string[] | null
          id?: string
          industry?: string | null
          is_approved?: boolean | null
          is_suspended?: boolean | null
          location?: string | null
          logo_url?: string | null
          name: string
          operating_address?: string | null
          reason_for_joining?: string | null
          registration_number?: string | null
          tin_number?: string | null
          trust_level?: string | null
          updated_at?: string | null
          verification_stage?: string | null
          website?: string | null
        }
        Update: {
          admin_notes?: string | null
          approved_at?: string | null
          approved_by?: string | null
          business_type?: string | null
          contact_email?: string | null
          contact_person_id_type?: string | null
          contact_person_name?: string | null
          contact_phone?: string | null
          created_at?: string | null
          created_by?: string
          date_of_incorporation?: string | null
          description?: string | null
          director_id_types?: string[] | null
          director_names?: string[] | null
          id?: string
          industry?: string | null
          is_approved?: boolean | null
          is_suspended?: boolean | null
          location?: string | null
          logo_url?: string | null
          name?: string
          operating_address?: string | null
          reason_for_joining?: string | null
          registration_number?: string | null
          tin_number?: string | null
          trust_level?: string | null
          updated_at?: string | null
          verification_stage?: string | null
          website?: string | null
        }
        Relationships: []
      }
      company_documents: {
        Row: {
          company_id: string
          document_type: string
          document_url: string
          file_name: string | null
          id: string
          review_notes: string | null
          review_status: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          uploaded_at: string | null
          uploaded_by: string
        }
        Insert: {
          company_id: string
          document_type: string
          document_url: string
          file_name?: string | null
          id?: string
          review_notes?: string | null
          review_status?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          uploaded_at?: string | null
          uploaded_by: string
        }
        Update: {
          company_id?: string
          document_type?: string
          document_url?: string
          file_name?: string | null
          id?: string
          review_notes?: string | null
          review_status?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          uploaded_at?: string | null
          uploaded_by?: string
        }
        Relationships: [
          {
            foreignKeyName: "company_documents_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      feature_flags: {
        Row: {
          description: string | null
          enabled: boolean | null
          id: string
          key: string
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          description?: string | null
          enabled?: boolean | null
          id?: string
          key: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          description?: string | null
          enabled?: boolean | null
          id?: string
          key?: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: []
      }
      gig_applications: {
        Row: {
          applicant_id: string
          applied_at: string | null
          gig_id: string
          id: string
          message: string | null
          status: string | null
        }
        Insert: {
          applicant_id: string
          applied_at?: string | null
          gig_id: string
          id?: string
          message?: string | null
          status?: string | null
        }
        Update: {
          applicant_id?: string
          applied_at?: string | null
          gig_id?: string
          id?: string
          message?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "gig_applications_gig_id_fkey"
            columns: ["gig_id"]
            isOneToOne: false
            referencedRelation: "gigs"
            referencedColumns: ["id"]
          },
        ]
      }
      gigs: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          budget: string | null
          category: string | null
          created_at: string | null
          created_by: string
          description: string
          id: string
          is_approved: boolean | null
          location: string | null
          status: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          budget?: string | null
          category?: string | null
          created_at?: string | null
          created_by: string
          description?: string
          id?: string
          is_approved?: boolean | null
          location?: string | null
          status?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          budget?: string | null
          category?: string | null
          created_at?: string | null
          created_by?: string
          description?: string
          id?: string
          is_approved?: boolean | null
          location?: string | null
          status?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      job_applications: {
        Row: {
          applicant_id: string
          applied_at: string | null
          cover_note: string | null
          cv_url: string | null
          id: string
          job_id: string
          status: string | null
          updated_at: string | null
        }
        Insert: {
          applicant_id: string
          applied_at?: string | null
          cover_note?: string | null
          cv_url?: string | null
          id?: string
          job_id: string
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          applicant_id?: string
          applied_at?: string | null
          cover_note?: string | null
          cv_url?: string | null
          id?: string
          job_id?: string
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "job_applications_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      job_categories: {
        Row: {
          created_at: string | null
          icon: string | null
          id: string
          name: string
        }
        Insert: {
          created_at?: string | null
          icon?: string | null
          id?: string
          name: string
        }
        Update: {
          created_at?: string | null
          icon?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      jobs: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          category_id: string | null
          company_id: string | null
          created_at: string | null
          created_by: string
          deadline: string | null
          description: string
          id: string
          is_approved: boolean | null
          is_featured: boolean | null
          job_type: string | null
          location: string | null
          requirements: string[] | null
          salary_range: string | null
          status: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          category_id?: string | null
          company_id?: string | null
          created_at?: string | null
          created_by: string
          deadline?: string | null
          description?: string
          id?: string
          is_approved?: boolean | null
          is_featured?: boolean | null
          job_type?: string | null
          location?: string | null
          requirements?: string[] | null
          salary_range?: string | null
          status?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          category_id?: string | null
          company_id?: string | null
          created_at?: string | null
          created_by?: string
          deadline?: string | null
          description?: string
          id?: string
          is_approved?: boolean | null
          is_featured?: boolean | null
          job_type?: string | null
          location?: string | null
          requirements?: string[] | null
          salary_range?: string | null
          status?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "jobs_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "job_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "jobs_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string | null
          id: string
          is_read: boolean | null
          message: string
          title: string
          type: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message: string
          title: string
          type?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message?: string
          title?: string
          type?: string | null
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string | null
          deleted_at: string | null
          email: string | null
          full_name: string
          id: string
          is_deleted: boolean | null
          is_suspended: boolean | null
          is_verified: boolean | null
          location: string | null
          phone: string | null
          profile_completion: number | null
          skills: string[] | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          deleted_at?: string | null
          email?: string | null
          full_name?: string
          id?: string
          is_deleted?: boolean | null
          is_suspended?: boolean | null
          is_verified?: boolean | null
          location?: string | null
          phone?: string | null
          profile_completion?: number | null
          skills?: string[] | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          deleted_at?: string | null
          email?: string | null
          full_name?: string
          id?: string
          is_deleted?: boolean | null
          is_suspended?: boolean | null
          is_verified?: boolean | null
          location?: string | null
          phone?: string | null
          profile_completion?: number | null
          skills?: string[] | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      reports: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          reason: string
          reporter_id: string
          resolved_at: string | null
          resolved_by: string | null
          resource_id: string
          resource_type: string
          status: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          reason: string
          reporter_id: string
          resolved_at?: string | null
          resolved_by?: string | null
          resource_id: string
          resource_type: string
          status?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          reason?: string
          reporter_id?: string
          resolved_at?: string | null
          resolved_by?: string | null
          resource_id?: string
          resource_type?: string
          status?: string | null
        }
        Relationships: []
      }
      saved_jobs: {
        Row: {
          id: string
          job_id: string
          saved_at: string | null
          user_id: string
        }
        Insert: {
          id?: string
          job_id: string
          saved_at?: string | null
          user_id: string
        }
        Update: {
          id?: string
          job_id?: string
          saved_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "saved_jobs_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          assigned_at: string | null
          assigned_by: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          assigned_at?: string | null
          assigned_by?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          assigned_at?: string | null
          assigned_by?: string | null
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
      ensure_super_admin_role: {
        Args: { _user_id: string }
        Returns: undefined
      }
      get_user_role: {
        Args: { _user_id: string }
        Returns: Database["public"]["Enums"]["app_role"]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role:
        | "job_seeker"
        | "employer"
        | "freelancer"
        | "admin"
        | "super_admin"
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
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
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
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
      app_role: [
        "job_seeker",
        "employer",
        "freelancer",
        "admin",
        "super_admin",
      ],
    },
  },
} as const
