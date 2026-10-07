import { getTranslations } from "next-intl/server";
import { Box, Paper, Typography } from "@mui/material";
import { ReportPageLayout } from "../_components/ReportPageLayout";
import { ReportChart } from "../_components/ReportChart";
import { parseSearchParamsToFilters } from "@/actions/reports/types";
import {
  getCampaignPerformance,
  getCampaignROI,
  getTopTemplates,
  getTargetListGrowth,
} from "@/actions/reports/campaigns";

type Props = { searchParams: Promise<Record<string, string | undefined>> };

export default async function CampaignsReportPage({ searchParams }: Props) {
  const resolvedParams = await searchParams;
  const params = new URLSearchParams(
    Object.entries(resolvedParams).filter(
      (entry): entry is [string, string] => entry[1] !== undefined
    )
  );
  const filters = parseSearchParamsToFilters(params);
  const t = await getTranslations("ReportsPage");

  const [performance, campaignROI, topTemplates, targetGrowth] = await Promise.all([
    getCampaignPerformance(filters),
    getCampaignROI(filters),
    getTopTemplates(filters),
    getTargetListGrowth(filters),
  ]);

  return (
    <ReportPageLayout
      title={t("campaigns.title")}
      description={t("campaigns.description")}
      category="campaigns"
      currentFilters={params.toString()}
    >
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "repeat(3, 1fr)" }, gap: 2 }}>
        {[[t("campaigns.sent"), performance.sent.toLocaleString()], [t("campaigns.openRate"), `${performance.openRate}%`], [t("campaigns.clickRate"), `${performance.clickRate}%`]].map(([label, value]) =>
          <Paper key={label} variant="outlined" sx={{ p: 3 }}><Typography variant="body2" color="text.secondary">{label}</Typography><Typography variant="h5" sx={{ mt: 1, fontWeight: 600 }}>{value}</Typography></Paper>)}
      </Box>
      <ReportChart data={campaignROI} titleKey="campaignROI" type="bar" />
      <ReportChart data={topTemplates} titleKey="topTemplates" type="bar" layout="horizontal" />
      <ReportChart data={targetGrowth} titleKey="targetGrowth" type="area" />
    </ReportPageLayout>
  );
}
