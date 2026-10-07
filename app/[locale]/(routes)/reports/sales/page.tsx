import { getTranslations } from "next-intl/server";
import { cookies } from "next/headers";
import { getDefaultCurrency, formatCurrency as formatCurrencyUtil } from "@/lib/currency";
import { Decimal } from "@prisma/client/runtime/client";
import { Box, Paper, Typography } from "@mui/material";
import { ReportPageLayout } from "../_components/ReportPageLayout";
import { ReportChart } from "../_components/ReportChart";
import { parseSearchParamsToFilters } from "@/actions/reports/types";
import {
  getRevenue,
  getPipelineValue,
  getOppsByStage,
  getOppsByMonth,
  getWinLossRate,
  getAvgDealSize,
  getSalesCycleLength,
} from "@/actions/reports/sales";

type Props = { searchParams: Promise<Record<string, string | undefined>> };

export default async function SalesReportPage({ searchParams }: Props) {
  const resolvedParams = await searchParams;
  const params = new URLSearchParams(
    Object.entries(resolvedParams).filter(
      (entry): entry is [string, string] => entry[1] !== undefined
    )
  );
  const filters = parseSearchParamsToFilters(params);
  const t = await getTranslations("ReportsPage");

  const cookieStore = await cookies();
  const defaultCurrency = await getDefaultCurrency();
  const displayCurrency = cookieStore.get("display_currency")?.value || defaultCurrency;

  const [revenue, pipeline, oppsByStage, oppsByMonth, winLoss, avgDeal, cycleLength] =
    await Promise.all([
      getRevenue(filters, displayCurrency),
      getPipelineValue(filters, displayCurrency),
      getOppsByStage(filters),
      getOppsByMonth(filters),
      getWinLossRate(filters),
      getAvgDealSize(filters, displayCurrency),
      getSalesCycleLength(filters),
    ]);

  return (
    <ReportPageLayout
      title={t("sales.title")}
      description={t("sales.description")}
      category="sales"
      currentFilters={params.toString()}
    >
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "repeat(3, 1fr)" }, gap: 2 }}>
        {[[t("sales.revenue"), formatCurrencyUtil(new Decimal(revenue), displayCurrency)], [t("sales.pipeline"), formatCurrencyUtil(new Decimal(pipeline), displayCurrency)], [t("sales.avgDeal"), formatCurrencyUtil(new Decimal(avgDeal), displayCurrency)]].map(([label, value]) =>
          <Paper key={label} variant="outlined" sx={{ p: 3 }}><Typography variant="body2" color="text.secondary">{label}</Typography><Typography variant="h5" sx={{ mt: 1, fontWeight: 600 }}>{value}</Typography></Paper>)}
      </Box>
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)" }, gap: 2 }}>
        {[[t("sales.winRate"), `${winLoss.rate}%`], [t("sales.cycleLength"), `${cycleLength} ${t("sales.days")}`]].map(([label, value]) =>
          <Paper key={label} variant="outlined" sx={{ p: 3 }}><Typography variant="body2" color="text.secondary">{label}</Typography><Typography variant="h5" sx={{ mt: 1, fontWeight: 600 }}>{value}</Typography></Paper>)}
      </Box>
      <ReportChart data={oppsByStage} titleKey="oppsByStage" type="bar" />
      <ReportChart data={oppsByMonth} titleKey="oppsByMonth" type="area" />
    </ReportPageLayout>
  );
}
