// Placeholder types — replace with `supabase gen types typescript` output
// when connected to a live Supabase project.

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      schools: {
        Row: {
          id: string;
          name: string;
          slug: string;
          owner_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          owner_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          owner_id?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      profiles: {
        Row: {
          id: string;
          school_id: string | null;
          full_name: string;
          avatar_url: string | null;
          role: "owner" | "instructor" | "admin_desk";
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          school_id?: string | null;
          full_name: string;
          avatar_url?: string | null;
          role?: "owner" | "instructor" | "admin_desk";
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          school_id?: string | null;
          full_name?: string;
          avatar_url?: string | null;
          role?: "owner" | "instructor" | "admin_desk";
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "profiles_school_id_fkey";
            columns: ["school_id"];
            isOneToOne: false;
            referencedRelation: "schools";
            referencedColumns: ["id"];
          },
        ];
      };
      students: {
        Row: {
          id: string;
          school_id: string;
          full_name: string;
          email: string | null;
          phone: string | null;
          belt_rank: string | null;
          notes: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          school_id: string;
          full_name: string;
          email?: string | null;
          phone?: string | null;
          belt_rank?: string | null;
          notes?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          school_id?: string;
          full_name?: string;
          email?: string | null;
          phone?: string | null;
          belt_rank?: string | null;
          notes?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "students_school_id_fkey";
            columns: ["school_id"];
            isOneToOne: false;
            referencedRelation: "schools";
            referencedColumns: ["id"];
          },
        ];
      };
      categories: {
        Row: {
          id: string;
          school_id: string;
          name: string;
          color: string;
          sort_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          school_id: string;
          name: string;
          color?: string;
          sort_order?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          school_id?: string;
          name?: string;
          color?: string;
          sort_order?: number;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "categories_school_id_fkey";
            columns: ["school_id"];
            isOneToOne: false;
            referencedRelation: "schools";
            referencedColumns: ["id"];
          },
        ];
      };
      tasks: {
        Row: {
          id: string;
          school_id: string;
          title: string;
          description: string | null;
          status: "todo" | "in_progress" | "completed";
          priority: "low" | "normal" | "high" | "urgent";
          category_id: string | null;
          student_id: string | null;
          due_date: string | null;
          completed_at: string | null;
          created_by: string;
          recurring_rule_id: string | null;
          parent_task_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          school_id: string;
          title: string;
          description?: string | null;
          status?: "todo" | "in_progress" | "completed";
          priority?: "low" | "normal" | "high" | "urgent";
          category_id?: string | null;
          student_id?: string | null;
          due_date?: string | null;
          completed_at?: string | null;
          created_by: string;
          recurring_rule_id?: string | null;
          parent_task_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          school_id?: string;
          title?: string;
          description?: string | null;
          status?: "todo" | "in_progress" | "completed";
          priority?: "low" | "normal" | "high" | "urgent";
          category_id?: string | null;
          student_id?: string | null;
          due_date?: string | null;
          completed_at?: string | null;
          created_by?: string;
          recurring_rule_id?: string | null;
          parent_task_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "tasks_school_id_fkey";
            columns: ["school_id"];
            isOneToOne: false;
            referencedRelation: "schools";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "tasks_category_id_fkey";
            columns: ["category_id"];
            isOneToOne: false;
            referencedRelation: "categories";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "tasks_student_id_fkey";
            columns: ["student_id"];
            isOneToOne: false;
            referencedRelation: "students";
            referencedColumns: ["id"];
          },
        ];
      };
      checklist_items: {
        Row: {
          id: string;
          task_id: string;
          text: string;
          is_completed: boolean;
          sort_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          task_id: string;
          text: string;
          is_completed?: boolean;
          sort_order?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          task_id?: string;
          text?: string;
          is_completed?: boolean;
          sort_order?: number;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "checklist_items_task_id_fkey";
            columns: ["task_id"];
            isOneToOne: false;
            referencedRelation: "tasks";
            referencedColumns: ["id"];
          },
        ];
      };
      task_assignments: {
        Row: {
          id: string;
          task_id: string;
          user_id: string;
          assigned_at: string;
        };
        Insert: {
          id?: string;
          task_id: string;
          user_id: string;
          assigned_at?: string;
        };
        Update: {
          id?: string;
          task_id?: string;
          user_id?: string;
          assigned_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "task_assignments_task_id_fkey";
            columns: ["task_id"];
            isOneToOne: false;
            referencedRelation: "tasks";
            referencedColumns: ["id"];
          },
        ];
      };
      recurring_rules: {
        Row: {
          id: string;
          school_id: string;
          frequency: "daily" | "weekly" | "monthly";
          day_of_week: number | null;
          day_of_month: number | null;
          next_run_at: string;
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          school_id: string;
          frequency: "daily" | "weekly" | "monthly";
          day_of_week?: number | null;
          day_of_month?: number | null;
          next_run_at: string;
          is_active?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          school_id?: string;
          frequency?: "daily" | "weekly" | "monthly";
          day_of_week?: number | null;
          day_of_month?: number | null;
          next_run_at?: string;
          is_active?: boolean;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "recurring_rules_school_id_fkey";
            columns: ["school_id"];
            isOneToOne: false;
            referencedRelation: "schools";
            referencedColumns: ["id"];
          },
        ];
      };
      activities: {
        Row: {
          id: string;
          deal_id: string;
          user_id: string;
          type: "call" | "email" | "meeting" | "note" | "stage_change";
          notes: string | null;
          occurred_at: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          deal_id: string;
          user_id: string;
          type: "call" | "email" | "meeting" | "note" | "stage_change";
          notes?: string | null;
          occurred_at?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          deal_id?: string;
          user_id?: string;
          type?: "call" | "email" | "meeting" | "note" | "stage_change";
          notes?: string | null;
          occurred_at?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "activities_deal_id_fkey";
            columns: ["deal_id"];
            isOneToOne: false;
            referencedRelation: "deals";
            referencedColumns: ["id"];
          },
        ];
      };
      deals: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          company: string | null;
          contact_name: string | null;
          value: number | null;
          stage: "lead" | "qualified" | "proposal" | "negotiation" | "won" | "lost";
          close_date: string | null;
          next_action: string | null;
          follow_up_date: string | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          company?: string | null;
          contact_name?: string | null;
          value?: number | null;
          stage?: "lead" | "qualified" | "proposal" | "negotiation" | "won" | "lost";
          close_date?: string | null;
          next_action?: string | null;
          follow_up_date?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          company?: string | null;
          contact_name?: string | null;
          value?: number | null;
          stage?: "lead" | "qualified" | "proposal" | "negotiation" | "won" | "lost";
          close_date?: string | null;
          next_action?: string | null;
          follow_up_date?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "deals_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      notifications: {
        Row: {
          id: string;
          user_id: string;
          task_id: string | null;
          type: "due_soon" | "overdue" | "assigned" | "status_change";
          title: string;
          body: string | null;
          is_read: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          task_id?: string | null;
          type: "due_soon" | "overdue" | "assigned" | "status_change";
          title: string;
          body?: string | null;
          is_read?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          task_id?: string | null;
          type?: "due_soon" | "overdue" | "assigned" | "status_change";
          title?: string;
          body?: string | null;
          is_read?: boolean;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "notifications_task_id_fkey";
            columns: ["task_id"];
            isOneToOne: false;
            referencedRelation: "tasks";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: {};
    Functions: {
      get_user_school_id: {
        Args: Record<string, never>;
        Returns: string;
      };
      get_user_role: {
        Args: Record<string, never>;
        Returns: string;
      };
    };
    Enums: {};
    CompositeTypes: {};
  };
};
