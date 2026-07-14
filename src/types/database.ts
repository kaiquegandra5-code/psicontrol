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
      profiles: {
        Row: {
          id: string;
          full_name: string;
          email: string;
          crp: string | null;
          specialty: string | null;
          phone: string | null;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          full_name: string;
          email: string;
          crp?: string | null;
          specialty?: string | null;
          phone?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          full_name?: string;
          email?: string;
          crp?: string | null;
          specialty?: string | null;
          phone?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      patients: {
        Row: {
          id: string;
          user_id: string;
          full_name: string;
          cpf: string | null;
          birth_date: string | null;
          phone: string | null;
          email: string | null;
          emergency_contact: string | null;
          address: string | null;
          notes: string | null;
          status: "active" | "inactive" | "archived";
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          full_name: string;
          cpf?: string | null;
          birth_date?: string | null;
          phone?: string | null;
          email?: string | null;
          emergency_contact?: string | null;
          address?: string | null;
          notes?: string | null;
          status?: "active" | "inactive" | "archived";
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          full_name?: string;
          cpf?: string | null;
          birth_date?: string | null;
          phone?: string | null;
          email?: string | null;
          emergency_contact?: string | null;
          address?: string | null;
          notes?: string | null;
          status?: "active" | "inactive" | "archived";
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      appointments: {
        Row: {
          id: string;
          user_id: string;
          patient_id: string;
          appointment_date: string;
          appointment_time: string;
          duration_minutes: number;
          appointment_type: "online" | "presencial";
          price: number;
          status: "scheduled" | "completed" | "cancelled" | "no_show";
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          patient_id: string;
          appointment_date: string;
          appointment_time: string;
          duration_minutes?: number;
          appointment_type: "online" | "presencial";
          price?: number;
          status?: "scheduled" | "completed" | "cancelled" | "no_show";
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          patient_id?: string;
          appointment_date?: string;
          appointment_time?: string;
          duration_minutes?: number;
          appointment_type?: "online" | "presencial";
          price?: number;
          status?: "scheduled" | "completed" | "cancelled" | "no_show";
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      clinical_records: {
        Row: {
          id: string;
          user_id: string;
          patient_id: string;
          session_date: string;
          session_number: number | null;
          evolution_text: string | null;
          therapeutic_goals: string | null;
          internal_notes: string | null;
          interventions: string | null;
          observations: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          patient_id: string;
          session_date: string;
          session_number?: number | null;
          evolution_text?: string | null;
          therapeutic_goals?: string | null;
          internal_notes?: string | null;
          interventions?: string | null;
          observations?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          patient_id?: string;
          session_date?: string;
          session_number?: number | null;
          evolution_text?: string | null;
          therapeutic_goals?: string | null;
          internal_notes?: string | null;
          interventions?: string | null;
          observations?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      document_templates: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          type: "declaration" | "certificate" | "referral" | "contract" | "report" | "other";
          content: string;
          is_default: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          type: "declaration" | "certificate" | "referral" | "contract" | "report" | "other";
          content: string;
          is_default?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          type?: "declaration" | "certificate" | "referral" | "contract" | "report" | "other";
          content?: string;
          is_default?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      generated_documents: {
        Row: {
          id: string;
          user_id: string;
          patient_id: string;
          template_id: string | null;
          title: string;
          content: string;
          pdf_url: string | null;
          document_type: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          patient_id: string;
          template_id?: string | null;
          title: string;
          content: string;
          pdf_url?: string | null;
          document_type: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          patient_id?: string;
          template_id?: string | null;
          title?: string;
          content?: string;
          pdf_url?: string | null;
          document_type?: string;
          created_at?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

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
