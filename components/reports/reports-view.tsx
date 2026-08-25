"use client";

import { useState } from "react";
import { usePreferences } from "@/lib/i18n/preferences";
import { Tabs } from "@/components/ui/tabs";
import { Card, CardBody } from "@/components/ui/card";
import {
  DiseaseReportForm,
  HealthReportForm,
} from "./report-forms";
import { MyReports } from "./my-reports";
import type { DiseaseType, SymptomOption } from "@/lib/types";

type TabId = "disease" | "health";

export function ReportsView({
  diseaseTypes,
  symptomOptions,
  defaults,
}: {
  diseaseTypes: Pick<DiseaseType, "id" | "name_en" | "name_mm">[];
  symptomOptions: Pick<SymptomOption, "id" | "name_en" | "name_mm">[];
  defaults: { fullName: string; phone: string };
}) {
  const { lang } = usePreferences();
  const [tab, setTab] = useState<TabId>("disease");
  const [refreshKey, setRefreshKey] = useState(0);

  return (
    <div className="space-y-10">
      <section>
        <Tabs<TabId>
          ariaLabel="Report type"
          value={tab}
          onChange={setTab}
          tabs={[
            { id: "disease", label: lang === "en" ? "Disease report" : "ရောဂါ အစီရင်ခံချက်" },
            { id: "health", label: lang === "en" ? "Health report" : "ကျန်းမာရေး အစီရင်ခံချက်" },
          ]}
        />

        <Card className="mt-5">
          <CardBody className="md:p-8">
            {tab === "disease" ? (
              <DiseaseReportForm
                diseaseTypes={diseaseTypes}
                symptomOptions={symptomOptions}
                defaults={defaults}
                onSubmitted={() => setRefreshKey((k) => k + 1)}
              />
            ) : (
              <HealthReportForm
                defaults={defaults}
                onSubmitted={() => setRefreshKey((k) => k + 1)}
              />
            )}
          </CardBody>
        </Card>

        <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
          {lang === "en"
            ? "Reports require sign-in. Your name and phone are visible only to reviewers."
            : "အစီရင်ခံရန် လော့ဂ်အင် ဝင်ရောက်ရန် လိုအပ်ပါသည်။ သင့်အမည်နှင့် ဖုန်းနံပါတ်ကို စစ်ဆေးသူများသာ မြင်ရမည်။"}
        </p>
      </section>

      <section>
        <h2 className="mb-4 text-xl font-bold leading-[1.6]">
          {lang === "en" ? "Your submissions" : "သင်ပေးပို့ထားသည့် အစီရင်ခံချက်များ"}
        </h2>
        <MyReports refreshKey={refreshKey} />
      </section>
    </div>
  );
}
