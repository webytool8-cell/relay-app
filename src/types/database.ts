export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      organizations: {
        Row: Organization;
        Insert: Omit<Organization, "id" | "created_at">;
        Update: Partial<Omit<Organization, "id">>;
      };
      users: {
        Row: User;
        Insert: Omit<User, "id" | "created_at">;
        Update: Partial<Omit<User, "id">>;
      };
      records: {
        Row: ClientRecord;
        Insert: Omit<ClientRecord, "id" | "created_at" | "updated_at">;
        Update: Partial<Omit<ClientRecord, "id">>;
      };
      interactions: {
        Row: Interaction;
        Insert: Omit<Interaction, "id" | "created_at">;
        Update: Partial<Omit<Interaction, "id">>;
      };
      flags: {
        Row: Flag;
        Insert: Omit<Flag, "id" | "created_at">;
        Update: Partial<Omit<Flag, "id">>;
      };
      custom_fields: {
        Row: CustomField;
        Insert: Omit<CustomField, "id" | "created_at">;
        Update: Partial<Omit<CustomField, "id">>;
      };
      custom_field_values: {
        Row: CustomFieldValue;
        Insert: Omit<CustomFieldValue, "id">;
        Update: Partial<Omit<CustomFieldValue, "id">>;
      };
    };
    Views: { [k: string]: never };
    Functions: { [k: string]: never };
    Enums: { [k: string]: never };
  };
}

export interface Organization {
  id: string;
  name: string;
  slug: string;
  settings: Json;
  created_at: string;
}

export interface User {
  id: string;
  organization_id: string;
  email: string;
  full_name: string;
  role: "viewer" | "worker" | "supervisor" | "admin";
  avatar_url: string | null;
  created_at: string;
}

export interface ClientRecord {
  id: string;
  organization_id: string;
  full_name: string;
  preferred_name: string | null;
  aliases: string[];
  dob: string | null;
  approximate_age: number | null;
  gender: string | null;
  phone: string | null;
  email: string | null;
  org_record_id: string | null;
  photo_url: string | null;
  status: string;
  assigned_user_id: string | null;
  assigned_team: string | null;
  program: string | null;
  notes: string | null;
  metadata: Json;
  created_at: string;
  updated_at: string;
}

export interface Interaction {
  id: string;
  record_id: string;
  organization_id: string;
  author_id: string;
  type: "note" | "status_change" | "assignment" | "call" | "referral" | "placement" | "flag" | "other";
  content: string;
  tags: string[];
  metadata: Json;
  created_at: string;
}

export interface Flag {
  id: string;
  record_id: string;
  organization_id: string;
  author_id: string;
  type: "high_risk" | "medical" | "escalated" | "priority" | "custom";
  label: string;
  description: string | null;
  resolved: boolean;
  created_at: string;
}

export interface CustomField {
  id: string;
  organization_id: string;
  name: string;
  label: string;
  field_type: "text" | "number" | "boolean" | "select" | "date";
  options: string[] | null;
  required: boolean;
  created_at: string;
}

export interface CustomFieldValue {
  id: string;
  record_id: string;
  custom_field_id: string;
  value: Json;
}
