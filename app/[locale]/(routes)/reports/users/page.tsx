import { getTranslations } from "next-intl/server";
import { Paper, Typography } from "@mui/material";
import { ReportPageLayout } from "../_components/ReportPageLayout";
import { ReportChart } from "../_components/ReportChart";
import { parseSearchParamsToFilters } from "@/actions/reports/types";
import {
  getActiveUsersByYear,
  getActiveUsersLifetime,
  getUserGrowth,
  getUsersByRole,
} from "@/actions/reports/users";

type Props = { searchParams: Promise<Record<string, string | undefined>> };

export default async function UsersReportPage({ searchParams }: Props) {
  const resolvedParams = await searchParams;
  const params = new URLSearchParams(
    Object.entries(resolvedParams).filter(
      (entry): entry is [string, string] => entry[1] !== undefined
    )
  );
  const filters = parseSearchParamsToFilters(params);
  const t = await getTranslations("ReportsPage");

  const [activeByYear, totalActive, userGrowth, usersByRole] = await Promise.all([
    getActiveUsersByYear(),
    getActiveUsersLifetime(),
    getUserGrowth(filters),
    getUsersByRole(filters),
  ]);

  return (
    <ReportPageLayout
      title={t("users.title")}
      description={t("users.description")}
      category="users"
      currentFilters={params.toString()}
    >
      <Paper variant="outlined" sx={{ p: 3 }}><Typography variant="body2" color="text.secondary">{t("users.totalActive")}</Typography><Typography variant="h5" sx={{ mt: 1, fontWeight: 600 }}>{totalActive.toLocaleString()}</Typography></Paper>
      <ReportChart data={activeByYear} titleKey="activeByYear" type="bar" />
      <ReportChart data={userGrowth} titleKey="userGrowth" type="area" />
      <ReportChart data={usersByRole} titleKey="usersByRole" type="pie" />
    </ReportPageLayout>
  );
}
