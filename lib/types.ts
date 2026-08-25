export type UserRole = "USER" | "ADMIN";

export type FacilityType =
  | "PUBLIC_HOSPITAL"
  | "PRIVATE_HOSPITAL"
  | "HEALTH_CENTER"
  | "RED_CROSS_TEAM";

export type FacilityOrganization = "GOVERNMENT" | "PRIVATE" | "MYANMAR_RED_CROSS";

export type ArticleStatus = "DRAFT" | "PUBLISHED";

export type ReportStatus = "SUBMITTED" | "UNDER_REVIEW" | "VERIFIED" | "REJECTED";

export type SeverityLevel = "MILD" | "MODERATE" | "SEVERE";

export type HealthReportType =
  | "HEALTH_SERVICE_ISSUE"
  | "FACILITY_ISSUE"
  | "MEDICINE_AVAILABILITY"
  | "PUBLIC_HEALTH_CONCERN"
  | "OTHER";

export interface Region {
  id: string;
  name_en: string;
  name_mm: string | null;
}

export interface City {
  id: string;
  region_id: string;
  name_en: string;
  name_mm: string | null;
}

export interface Township {
  id: string;
  city_id: string;
  name_en: string;
  name_mm: string | null;
}

export interface Profile {
  id: string;
  email: string | null;
  full_name: string | null;
  phone: string | null;
  region_id: string | null;
  city_id: string | null;
  township_id: string | null;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

export interface DiseaseType {
  id: string;
  name_en: string;
  name_mm: string | null;
  category: string | null;
}

export interface SymptomOption {
  id: string;
  name_en: string;
  name_mm: string | null;
}
