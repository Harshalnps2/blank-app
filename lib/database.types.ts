/**
 * Hand-written database types for the MVP. Once Supabase CLI access is wired
 * up, these can be replaced by the output of `supabase gen types typescript`,
 * but the shape will remain the same so application code does not have to
 * change.
 */

export type CaregiverRole = "owner" | "caregiver";
export type CareEventType = "feed" | "diaper" | "sleep" | "soothing" | "note";
export type CareEventSource = "manual" | "ai_parsed" | "system";
export type AuditAction = "insert" | "update" | "delete" | "soft_delete" | "restore";
export type FeedingMethod = "breast" | "bottle" | "combo" | "unknown";

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

interface UsersRow {
  id: string;
  email: string;
  created_at: string;
  updated_at: string;
}

interface CaregiverProfilesRow {
  id: string;
  user_id: string;
  display_name: string | null;
  timezone: string | null;
  created_at: string;
  updated_at: string;
}

export interface BabiesRow {
  id: string;
  name: string;
  birth_date: string | null;
  feeding_method: FeedingMethod;
  created_by: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface BabyCaregiversRow {
  baby_id: string;
  user_id: string;
  role: CaregiverRole;
  invited_by: string | null;
  accepted_at: string | null;
  created_at: string;
}

interface NightShiftsRow {
  id: string;
  baby_id: string;
  caregiver_id: string;
  started_at: string;
  ended_at: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface CareEventsRow {
  id: string;
  baby_id: string;
  caregiver_id: string;
  night_shift_id: string | null;
  event_type: CareEventType;
  started_at: string;
  ended_at: string | null;
  duration_seconds: number | null;
  metadata_json: Json;
  source: CareEventSource;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export type CareEventInsert = Omit<
  CareEventsRow,
  "id" | "created_at" | "updated_at" | "deleted_at" | "source"
> & {
  id?: string;
  source?: CareEventSource;
};

export type CareEventUpdate = Partial<
  Omit<CareEventsRow, "id" | "baby_id" | "caregiver_id" | "created_at" | "updated_at">
>;

interface HandoffSummariesRow {
  id: string;
  baby_id: string;
  night_shift_id: string | null;
  generated_by: string;
  summary_text: string;
  share_token: string | null;
  shared_at: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

interface AuditLogsRow {
  id: number;
  actor_id: string | null;
  table_name: string;
  row_id: string;
  action: AuditAction;
  diff: Json;
  created_at: string;
}

export interface Database {
  public: {
    Tables: {
      users: {
        Row: UsersRow;
        Insert: Partial<UsersRow> & { id: string; email: string };
        Update: Partial<UsersRow>;
        Relationships: [];
      };
      caregiver_profiles: {
        Row: CaregiverProfilesRow;
        Insert: Partial<CaregiverProfilesRow> & { user_id: string };
        Update: Partial<CaregiverProfilesRow>;
        Relationships: [];
      };
      babies: {
        Row: BabiesRow;
        Insert: Partial<BabiesRow> & { name: string; created_by: string };
        Update: Partial<BabiesRow>;
        Relationships: [];
      };
      baby_caregivers: {
        Row: BabyCaregiversRow;
        Insert: Partial<BabyCaregiversRow> & { baby_id: string; user_id: string };
        Update: Partial<BabyCaregiversRow>;
        Relationships: [];
      };
      night_shifts: {
        Row: NightShiftsRow;
        Insert: Partial<NightShiftsRow> & { baby_id: string; caregiver_id: string };
        Update: Partial<NightShiftsRow>;
        Relationships: [];
      };
      care_events: {
        Row: CareEventsRow;
        Insert: CareEventInsert;
        Update: CareEventUpdate;
        Relationships: [];
      };
      handoff_summaries: {
        Row: HandoffSummariesRow;
        Insert: Partial<HandoffSummariesRow> & {
          baby_id: string;
          generated_by: string;
          summary_text: string;
        };
        Update: Partial<HandoffSummariesRow>;
        Relationships: [];
      };
      audit_logs: {
        Row: AuditLogsRow;
        Insert: Partial<AuditLogsRow> & { table_name: string; row_id: string; action: AuditAction };
        Update: Partial<AuditLogsRow>;
        Relationships: [];
      };
    };
    Views: { [_ in never]: never };
    Functions: { [_ in never]: never };
    Enums: {
      caregiver_role: CaregiverRole;
      care_event_type: CareEventType;
      care_event_source: CareEventSource;
      audit_action: AuditAction;
      feeding_method: FeedingMethod;
    };
    CompositeTypes: { [_ in never]: never };
  };
}
