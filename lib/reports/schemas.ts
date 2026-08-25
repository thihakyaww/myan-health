import { z } from "zod";

const uuid = z.string().uuid();

export const severityValues = ["MILD", "MODERATE", "SEVERE"] as const;
export const healthReportTypeValues = [
  "HEALTH_SERVICE_ISSUE",
  "FACILITY_ISSUE",
  "MEDICINE_AVAILABILITY",
  "PUBLIC_HEALTH_CONCERN",
  "OTHER",
] as const;

export const locationSchema = z.object({
  latitude: z.number({ message: "Pin the location on the map" }).min(-90).max(90),
  longitude: z.number({ message: "Pin the location on the map" }).min(-180).max(180),
  formatted_address: z.string().min(1, "Location address is missing"),
});

export const sharedFields = {
  reporter_name: z.string().min(2, "Name is required").max(120),
  reporter_phone: z
    .string()
    .min(6, "Phone number looks too short")
    .max(20)
    .regex(/^[+0-9()\s-]+$/, "Digits only"),
  region_id: uuid,
  city_id: uuid,
  township_id: uuid,
  description: z.string().min(10, "Please describe in at least 10 characters").max(2000),
};

export const diseaseReportSchema = z
  .object({
    ...sharedFields,
    disease_type_id: uuid,
    symptoms: z.array(uuid).min(1, "Select at least one symptom"),
    onset_date: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, "Enter a valid date")
      .refine((s) => new Date(s) <= new Date(), "Onset date cannot be in the future"),
    severity: z.enum(severityValues),
    ...locationSchema.shape,
  });
export type DiseaseReportInput = z.infer<typeof diseaseReportSchema>;

export const healthReportSchema = z.object({
  ...sharedFields,
  report_type: z.enum(healthReportTypeValues),
  ...locationSchema.shape,
});
export type HealthReportInput = z.infer<typeof healthReportSchema>;
