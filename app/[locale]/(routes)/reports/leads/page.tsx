import { getTranslations } from "next-intl/server";
import { Paper, Typography } from "@mui/material";
import { ReportPageLayout } from "../_components/ReportPageLayout";
import { ReportChart } from "../_components/ReportChart";
import { ReportTable } from "../_components/ReportTable";
import { parseSearchParamsToFilters } from "@/actions/reports/types";
import {
  getNewLeads,
  getLeadSources,
  getConversionRate,
  getNewContacts,
  getContactsByAccount,
} from "@/actions/reports/leads";

type Props = { searchParams: Promise<Record<string, string | undefined>> };

export default async function LeadsReportPage({ searchParams }: Props) {
  const resolvedParams = await searchParams;
  const params = new URLSearchParams(
    Object.entries(resolvedParams).filter(
      (entry): entry is [string, string] => entry[1] !== undefined
    )
  );
  const filters = parseSearchParamsToFilters(params);
  const t = await getTranslations("ReportsPage");

  const [newLeads, leadSources, conversion, newContacts, contactsByAccount] =
    await Promise.all([
      getNewLeads(filters),
      getLeadSources(filters),
      getConversionRate(filters),
      getNewContacts(filters),
      getContactsByAccount(filters),
    ]);

  return (
    <ReportPageLayout
      title={t("leads.title")}
      description={t("leads.description")}
      category="leads"
      currentFilters={params.toString()}
    >
      <Paper variant="outlined" sx={{ p: 3 }}>
        <Typography variant="body2" color="text.secondary">{t("leads.conversionRate")}</Typography>
        <Typography variant="h5" sx={{ mt: 1, fontWeight: 600 }}>{conversion.rate}%</Typography>
        <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: "block" }}>
          {conversion.converted} / {conversion.leads} {t("leads.converted")}
        </Typography>
      </Paper>
      <ReportChart data={newLeads} titleKey="newLeads" type="area" />
      <ReportChart data={leadSources} titleKey="leadSources" type="bar" />
      <ReportChart data={newContacts} titleKey="newContacts" type="area" />
      <ReportTable data={contactsByAccount} titleKey="contactsByAccount" />
    </ReportPageLayout>
  );
}
