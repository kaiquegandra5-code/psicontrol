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
      appointments: {
        Row: {
          appointment_date: string
          appointment_time: string
          appointment_type: string
          created_at: string
          duration_minutes: number
          id: string
          notes: string | null
          patient_id: string
          price: number
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          appointment_date: string
          appointment_time: string
          appointment_type: string
          created_at?: string
          duration_minutes?: number
          id?: string
          notes?: string | null
          patient_id: string
          price?: number
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          appointment_date?: string
          appointment_time?: string
          appointment_type?: string
          created_at?: string
          duration_minutes?: number
          id?: string
          notes?: string | null
          patient_id?: string
          price?: number
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "appointments_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      clinical_records: {
        Row: {
          created_at: string
          evolution_text: string | null
          id: string
          internal_notes: string | null
          interventions: string | null
          observations: string | null
          patient_id: string
          session_date: string
          session_number: number | null
          therapeutic_goals: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          evolution_text?: string | null
          id?: string
          internal_notes?: string | null
          interventions?: string | null
          observations?: string | null
          patient_id: string
          session_date: string
          session_number?: number | null
          therapeutic_goals?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          evolution_text?: string | null
          id?: string
          internal_notes?: string | null
          interventions?: string | null
          observations?: string | null
          patient_id?: string
          session_date?: string
          session_number?: number | null
          therapeutic_goals?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "clinical_records_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      document_templates: {
        Row: {
          content: string
          created_at: string
          id: string
          is_default: boolean
          name: string
          type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          is_default?: boolean
          name: string
          type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          is_default?: boolean
          name?: string
          type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      generated_documents: {
        Row: {
          content: string
          created_at: string
          document_type: string
          id: string
          patient_id: string
          pdf_url: string | null
          template_id: string | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          document_type: string
          id?: string
          patient_id: string
          pdf_url?: string | null
          template_id?: string | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          document_type?: string
          id?: string
          patient_id?: string
          pdf_url?: string | null
          template_id?: string | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "generated_documents_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "generated_documents_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "document_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      patients: {
        Row: {
          address: string | null
          birth_date: string | null
          cpf: string | null
          created_at: string
          email: string | null
          emergency_contact: string | null
          full_name: string
          id: string
          notes: string | null
          phone: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          address?: string | null
          birth_date?: string | null
          cpf?: string | null
          created_at?: string
          email?: string | null
          emergency_contact?: string | null
          full_name: string
          id?: string
          notes?: string | null
          phone?: string | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          address?: string | null
          birth_date?: string | null
          cpf?: string | null
          created_at?: string
          email?: string | null
          emergency_contact?: string | null
          full_name?: string
          id?: string
          notes?: string | null
          phone?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          crp: string | null
          email: string
          full_name: string
          id: string
          phone: string | null
          specialty: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          crp?: string | null
          email: string
          full_name: string
          id: string
          phone?: string | null
          specialty?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          crp?: string | null
          email?: string
          full_name?: string
          id?: string
          phone?: string | null
          specialty?: string | null
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const

// Convenience type aliases
export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type Patient = Database["public"]["Tables"]["patients"]["Row"];
export type Appointment = Database["public"]["Tables"]["appointments"]["Row"];
export type ClinicalRecord = Database["public"]["Tables"]["clinical_records"]["Row"];
export type DocumentTemplate = Database["public"]["Tables"]["document_templates"]["Row"];
export type GeneratedDocument = Database["public"]["Tables"]["generated_documents"]["Row"];

export type PatientInsert = Database["public"]["Tables"]["patients"]["Insert"];
export type PatientUpdate = Database["public"]["Tables"]["patients"]["Update"];
export type AppointmentInsert = Database["public"]["Tables"]["appointments"]["Insert"];
export type AppointmentUpdate = Database["public"]["Tables"]["appointments"]["Update"];
export type ClinicalRecordInsert = Database["public"]["Tables"]["clinical_records"]["Insert"];
export type ClinicalRecordUpdate = Database["public"]["Tables"]["clinical_records"]["Update"];
export type DocumentTemplateInsert = Database["public"]["Tables"]["document_templates"]["Insert"];
export type DocumentTemplateUpdate = Database["public"]["Tables"]["document_templates"]["Update"];
