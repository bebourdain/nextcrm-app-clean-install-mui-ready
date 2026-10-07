import { Box, Divider } from "@mui/material";
import { MuiPageHeader } from "@/components/mui/MuiPageHeader";
import { getDashboardKPIs } from "@/actions/reports/dashboard";
import { parseSearchParamsToFilters } from "@/actions/reports/types";
import { KPICard } from "./_components/KPICard";
import { DateRangePicker } from "./_components/DateRangePicker";
import { Suspense } from "react";
import { getTranslations } from "next-intl/server";
import { cookies } from "next/headers";
import { getDefaultCurrency } from "@/lib/currency";

type Props = {
  searchParams: Promise<Record<string, string | undefined>>;
};

export default async function ReportsPage({ searchParams }: Props) {
  const resolvedParams = await searchParams;
  const params = new URLSearchParams(
    Object.entries(resolvedParams).filter(
      (entry): entry is [string, string] => entry[1] !== undefined
    )
  );
  const filters = parseSearchParamsToFilters(params);
  const cookieStore = await cookies();
  const defaultCurrency = await getDefaultCurrency();
  const displayCurrency = cookieStore.get("display_currency")?.value || defaultCurrency;
  const kpis = await getDashboardKPIs(filters, displayCurrency);
  const t = await getTranslations("ReportsPage");
  const dateParams = params.toString();

  return (
    <Box sx={{ width: "100%", pb: 6 }}>
      <MuiPageHeader title={t("title")} description={t("description")} />
      <Divider sx={{ my: 2 }} />
      <Box sx={{ display: "grid", gap: 3 }}>
        <Suspense>
          <DateRangePicker />
        </Suspense>
        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)", lg: "repeat(3, 1fr)", xl: "repeat(5, 1fr)" }, gap: 2 }}>
          {kpis.map((kpi) => (
            <KPICard key={kpi.label} kpi={kpi} dateParams={dateParams} displayCurrency={displayCurrency} />
          ))}
        </Box>
      </Box>
    </Box>
  );
}
