"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createClient } from "@/lib/supabase/client";
import {
  diseaseReportSchema,
  healthReportSchema,
  severityValues,
  healthReportTypeValues,
  type DiseaseReportInput,
  type HealthReportInput,
} from "@/lib/reports/schemas";
import type { DiseaseType, SymptomOption } from "@/lib/types";
import { Input, Select, Textarea } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge, pillTone } from "@/components/ui/badge";
import { LocationCascade, type CascadeValue } from "@/components/location/location-cascade";
import { LocationPicker, type PickedLocation } from "@/components/location/location-picker";
import { usePreferences } from "@/lib/i18n/preferences";

const SEVERITY_LABEL: Record<(typeof severityValues)[number], { my: string; en: string }> = {
  MILD: { my: "ပေါ့ပါး", en: "Mild" },
  MODERATE: { my: "အလယ်အလတ်", en: "Moderate" },
  SEVERE: { my: "ပြင်းထန်", en: "Severe" },
};

const HEALTH_TYPE_LABEL: Record<
  (typeof healthReportTypeValues)[number],
  { my: string; en: string }
> = {
  HEALTH_SERVICE_ISSUE: { my: "ကျန်းမာရေး ဝန်ဆောင်မှု ပြဿနာ", en: "Health service issue" },
  FACILITY_ISSUE: { my: "ဆေးရုံ/ဌာန အခြေအနေ", en: "Facility issue" },
  MEDICINE_AVAILABILITY: { my: "ဆေးဝါး ရရှိမှု", en: "Medicine availability" },
  PUBLIC_HEALTH_CONCERN: { my: "စုပေါင်း ကျန်းမာရေး စိုးရိမ်ချက်", en: "Public health concern" },
  OTHER: { my: "အခြား", en: "Other" },
};

function Field({
  label,
  error,
  required,
  children,
}: {
  label: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-semibold">
        {label}
        {required && <span className="ml-0.5 text-severe">*</span>}
      </label>
      {children}
      {error && <p className="text-sm text-severe">{error}</p>}
    </div>
  );
}

interface FormDefaults {
  fullName: string;
  phone: string;
}

/* ============================== Disease ============================== */

  const scrollToFirstError = () => {
    requestAnimationFrame(() => {
      document
        .querySelector("form p.text-severe")
        ?.scrollIntoView({ behavior: "smooth", block: "center" });
    });
  };

export function DiseaseReportForm({
  diseaseTypes,
  symptomOptions,
  defaults,
  onSubmitted,
}: {
  diseaseTypes: Pick<DiseaseType, "id" | "name_en" | "name_mm">[];
  symptomOptions: Pick<SymptomOption, "id" | "name_en" | "name_mm">[];
  defaults: FormDefaults;
  onSubmitted: () => void;
}) {
  const router = useRouter();
  const { lang } = usePreferences();
  const [serverError, setServerError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<DiseaseReportInput>({
    resolver: zodResolver(diseaseReportSchema),
    defaultValues: {
      reporter_name: defaults.fullName,
      reporter_phone: defaults.phone,
      symptoms: [],
    },
  });

  const cascade: CascadeValue = {
    region_id: watch("region_id") ?? "",
    city_id: watch("city_id") ?? "",
    township_id: watch("township_id") ?? "",
  };
  const picked: PickedLocation | null = (() => {
    const lat = watch("latitude");
    const lng = watch("longitude");
    if (typeof lat !== "number" || typeof lng !== "number") return null;
    return { latitude: lat, longitude: lng, formatted_address: watch("formatted_address") ?? "" };
  })();
  const symptoms = watch("symptoms") ?? [];

  async function onSubmit(values: DiseaseReportInput) {
    setServerError(null);
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      router.push("/auth/login?redirect=%2Freports");
      return;
    }
    const { error } = await supabase.from("disease_reports").insert({
      reporter_id: user.id,
      reporter_name: values.reporter_name,
      reporter_phone: values.reporter_phone,
      region_id: values.region_id,
      city_id: values.city_id,
      township_id: values.township_id,
      disease_type_id: values.disease_type_id,
      symptoms: values.symptoms,
      onset_date: values.onset_date,
      severity: values.severity,
      formatted_address: values.formatted_address,
      latitude: values.latitude,
      longitude: values.longitude,
      description: values.description,
    });
    if (error) {
      setServerError(error.message);
      return;
    }
    setDone(true);
    onSubmitted();
  }

  if (done) {
    return (
      <div className="rounded-[var(--radius)] border border-teal/30 bg-sky/40 p-8 text-center">
        <p className="text-lg font-bold leading-[1.75]">
          {lang === "en" ? "Report received — thank you." : "အစီရင်ခံချက် လက်ခံရရှိပါသည်"}
        </p>
        <p className="mx-auto mt-3 max-w-md text-sm leading-[1.75] text-muted">
          {lang === "en"
            ? <>Your report now has status <Badge tone={pillTone.SUBMITTED} dot>Submitted</Badge> and will be reviewed by an admin. You can track it under "Your submissions" below.</>
            : <>သင့်အစီရင်ခံချက်သည် <Badge tone={pillTone.SUBMITTED} dot>ပေးပို့ပြီး</Badge> အခြေအနေရှိပြီး စီမံခန့်ခွဲသူမှ စစ်ဆေးမည်ဖြစ်ပါသည်။ "သင်ပေးပို့ထားသည့် အစီရင်ခံချက်များ" တွင် ခြေရာခံနိုင်ပါသည်။</>}
        </p>
        <Button variant="secondary" className="mt-5" onClick={() => setDone(false)}>
          {lang === "en" ? "Submit another report" : "အစီရင်ခံချက် ထပ်မံပေးပို့ရန်"}
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit, scrollToFirstError)} className="space-y-6" noValidate>
      {serverError && (
        <p className="rounded-[var(--radius)] bg-severe-soft px-4 py-3 text-sm text-severe">
          {serverError}
        </p>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label={lang === "en" ? "Name" : "အမည်"} required error={errors.reporter_name?.message}>
          <Input {...register("reporter_name")} autoComplete="name" />
        </Field>
        <Field label={lang === "en" ? "Phone" : "ဖုန်း"} required error={errors.reporter_phone?.message}>
          <Input {...register("reporter_phone")} type="tel" autoComplete="tel" placeholder="09…" />
        </Field>
      </div>

      <Field label={lang === "en" ? "Location (Region · District · Township)" : "တည်နေရာ"} required
        error={errors.region_id?.message ?? errors.city_id?.message ?? errors.township_id?.message}>
        <LocationCascade
          value={cascade}
          onChange={(patch) => {
            if (patch.region_id !== undefined) setValue("region_id", patch.region_id, { shouldValidate: true });
            if (patch.city_id !== undefined) setValue("city_id", patch.city_id, { shouldValidate: true });
            if (patch.township_id !== undefined) setValue("township_id", patch.township_id, { shouldValidate: true });
          }}
        />
      </Field>

      <Field
        label={lang === "en" ? "Map location" : "မြေပုံ တည်နေရာ"}
        required
        error={
          errors.latitude?.message ??
          errors.longitude?.message ??
          errors.formatted_address?.message
        }
      >
        <LocationPicker
          value={picked}
          onChange={(v) => {
            if (!v) {
              setValue("latitude", undefined as never);
              setValue("longitude", undefined as never);
              setValue("formatted_address", "");
              return;
            }
            setValue("latitude", v.latitude, { shouldValidate: true });
            setValue("longitude", v.longitude, { shouldValidate: true });
            setValue("formatted_address", v.formatted_address, { shouldValidate: true });
          }}
        />
      </Field>

      <Field label={lang === "en" ? "Disease type" : "ရောဂါ အမျိုးအစား"} required error={errors.disease_type_id?.message}>
        <Select {...register("disease_type_id")}>
          <option value="">Select…</option>
          {diseaseTypes.map((d) => (
            <option key={d.id} value={d.id}>
              {lang === "en" ? d.name_en : (d.name_mm ?? d.name_en)}
            </option>
          ))}
        </Select>
      </Field>

      <Field label={lang === "en" ? "Symptoms" : "လက္ခဏာများ"} required error={errors.symptoms?.message}>
        <div className="flex flex-wrap gap-2">
          {symptomOptions.map((s) => {
            const active = symptoms.includes(s.id);
            return (
              <button
                key={s.id}
                type="button"
                aria-pressed={active}
                onClick={() =>
                  setValue(
                    "symptoms",
                    active ? symptoms.filter((x) => x !== s.id) : [...symptoms, s.id],
                    { shouldValidate: true }
                  )
                }
                className={`rounded-full border px-3.5 py-1.5 text-sm font-semibold transition-colors ${
                  active
                    ? "border-teal bg-teal text-white"
                    : "border-line bg-card text-muted hover:border-teal/40 hover:text-teal-dark"
                }`}
              >
                {lang === "en" ? s.name_en : (s.name_mm ?? s.name_en)}
              </button>
            );
          })}
        </div>
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label={lang === "en" ? "Onset date" : "ရောဂါ စဖြစ်သည့်ရက်"} required error={errors.onset_date?.message}>
          <Input
            {...register("onset_date")}
            type="date"
            max={new Date().toISOString().slice(0, 10)}
          />
        </Field>
        <Field label={lang === "en" ? "Severity" : "ပြင်းထန်မှု"} required error={errors.severity?.message}>
          <Select {...register("severity")}>
            <option value="">Select…</option>
            {severityValues.map((sv) => (
              <option key={sv} value={sv}>
                {lang === "en" ? SEVERITY_LABEL[sv].en : SEVERITY_LABEL[sv].my}
              </option>
            ))}
          </Select>
        </Field>
      </div>

      <Field label={lang === "en" ? "Description" : "ဖော်ပြချက်"} required error={errors.description?.message}>
        <Textarea
          {...register("description")}
          placeholder={lang === "en" ? "Briefly describe the situation…" : "တွေ့ရှိချက်များကို အကျဉ်းချုပ် ရေးပါ…"}
        />
      </Field>

      <Button type="submit" disabled={isSubmitting} size="lg" className="w-full sm:w-auto">
        {isSubmitting ? "Submitting…" : (lang === "en" ? "Submit report" : "အစီရင်ခံရန်")}
      </Button>
    </form>
  );
}

/* ============================== Health ============================== */

export function HealthReportForm({
  defaults,
  onSubmitted,
}: {
  defaults: FormDefaults;
  onSubmitted: () => void;
}) {
  const router = useRouter();
  const { lang } = usePreferences();
  const [serverError, setServerError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<HealthReportInput>({
    resolver: zodResolver(healthReportSchema),
    defaultValues: {
      reporter_name: defaults.fullName,
      reporter_phone: defaults.phone,
    },
  });

  const cascade: CascadeValue = {
    region_id: watch("region_id") ?? "",
    city_id: watch("city_id") ?? "",
    township_id: watch("township_id") ?? "",
  };
  const picked: PickedLocation | null = (() => {
    const lat = watch("latitude");
    const lng = watch("longitude");
    if (typeof lat !== "number" || typeof lng !== "number") return null;
    return { latitude: lat, longitude: lng, formatted_address: watch("formatted_address") ?? "" };
  })();

  async function onSubmit(values: HealthReportInput) {
    setServerError(null);
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      router.push("/auth/login?redirect=%2Freports");
      return;
    }
    const { error } = await supabase.from("health_reports").insert({
      reporter_id: user.id,
      reporter_name: values.reporter_name,
      reporter_phone: values.reporter_phone,
      region_id: values.region_id,
      city_id: values.city_id,
      township_id: values.township_id,
      report_type: values.report_type,
      formatted_address: values.formatted_address,
      latitude: values.latitude,
      longitude: values.longitude,
      description: values.description,
    });
    if (error) {
      setServerError(error.message);
      return;
    }
    setDone(true);
    onSubmitted();
  }

  if (done) {
    return (
      <div className="rounded-[var(--radius)] border border-teal/30 bg-sky/40 p-8 text-center">
        <p className="text-lg font-bold leading-[1.75]">
          {lang === "en" ? "Report received — thank you." : "အစီရင်ခံချက် လက်ခံရရှိပါသည်"}
        </p>
        <p className="mx-auto mt-3 max-w-md text-sm leading-[1.75] text-muted">
          {lang === "en"
            ? "Track its review status under \"Your submissions\" below."
            : "\"သင်ပေးပို့ထားသည့် အစီရင်ခံချက်များ\" တွင် စစ်ဆေးမှု အခြေအနေကို ခြေရာခံနိုင်ပါသည်။"}
        </p>
        <Button variant="secondary" className="mt-5" onClick={() => setDone(false)}>
          {lang === "en" ? "Submit another report" : "အစီရင်ခံချက် ထပ်မံပေးပို့ရန်"}
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit, scrollToFirstError)} className="space-y-6" noValidate>
      {serverError && (
        <p className="rounded-[var(--radius)] bg-severe-soft px-4 py-3 text-sm text-severe">
          {serverError}
        </p>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label={lang === "en" ? "Name" : "အမည်"} required error={errors.reporter_name?.message}>
          <Input {...register("reporter_name")} autoComplete="name" />
        </Field>
        <Field label={lang === "en" ? "Phone" : "ဖုန်း"} required error={errors.reporter_phone?.message}>
          <Input {...register("reporter_phone")} type="tel" autoComplete="tel" placeholder="09…" />
        </Field>
      </div>

      <Field label={lang === "en" ? "Location (Region · District · Township)" : "တည်နေရာ"} required
        error={errors.region_id?.message ?? errors.city_id?.message ?? errors.township_id?.message}>
        <LocationCascade
          value={cascade}
          onChange={(patch) => {
            if (patch.region_id !== undefined) setValue("region_id", patch.region_id, { shouldValidate: true });
            if (patch.city_id !== undefined) setValue("city_id", patch.city_id, { shouldValidate: true });
            if (patch.township_id !== undefined) setValue("township_id", patch.township_id, { shouldValidate: true });
          }}
        />
      </Field>

      <Field
        label={lang === "en" ? "Map location" : "မြေပုံ တည်နေရာ"}
        required
        error={errors.latitude?.message ?? errors.longitude?.message ?? errors.formatted_address?.message}
      >
        <LocationPicker
          value={picked}
          onChange={(v) => {
            if (!v) {
              setValue("latitude", undefined as never);
              setValue("longitude", undefined as never);
              setValue("formatted_address", "");
              return;
            }
            setValue("latitude", v.latitude, { shouldValidate: true });
            setValue("longitude", v.longitude, { shouldValidate: true });
            setValue("formatted_address", v.formatted_address, { shouldValidate: true });
          }}
        />
      </Field>

      <Field label={lang === "en" ? "Report type" : "အစီရင်ခံချက် အမျိုးအစား"} required error={errors.report_type?.message}>
        <Select {...register("report_type")}>
          <option value="">Select…</option>
          {healthReportTypeValues.map((t) => (
            <option key={t} value={t}>
              {lang === "en" ? HEALTH_TYPE_LABEL[t].en : HEALTH_TYPE_LABEL[t].my}
            </option>
          ))}
        </Select>
      </Field>

      <Field label={lang === "en" ? "Description" : "ဖော်ပြချက်"} required error={errors.description?.message}>
        <Textarea
          {...register("description")}
          placeholder={lang === "en" ? "Briefly describe the situation…" : "တွေ့ရှိချက်များကို အကျဉ်းချုပ် ရေးပါ…"}
        />
      </Field>

      <Button type="submit" disabled={isSubmitting} size="lg" className="w-full sm:w-auto">
        {isSubmitting ? "Submitting…" : (lang === "en" ? "Submit report" : "အစီရင်ခံရန်")}
      </Button>
    </form>
  );
}

export { HEALTH_TYPE_LABEL, SEVERITY_LABEL };
