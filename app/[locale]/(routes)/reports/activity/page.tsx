import { getTranslations } from "next-intl/server";
import { Paper, Typography } from "@mui/material";
import { ReportPageLayout } from "../_components/ReportPageLayout";
import { ReportChart } from "../_components/ReportChart";
import { parseSearchParamsToFilters } from "@/actions/reports/types";
import {
  getTasksCreatedCompleted,
  getOverdueTasks,
  getTasksByAssignee,
  getActivitiesByType,
} from "@/actions/reports/activity";

type Props = { searchParams: Promise<Record<string, string | undefined>> };

export default async function ActivityReportPage({ searchParams }: Props) {
  const resolvedParams = await searchParams;
  const params = new URLSearchParams(
    Object.entries(resolvedParams).filter(
      (entry): entry is [string, string] => entry[1] !== undefined
    )
  );
  const filters = parseSearchParamsToFilters(params);
  const t = await getTranslations("ReportsPage");

  const [tasksData, overdue, tasksByAssignee, activitiesByType] = await Promise.all([
    getTasksCreatedCompleted(filters),
    getOverdueTasks(filters),
    getTasksByAssignee(filters),
    getActivitiesByType(filters),
  ]);

  const taskChartData = tasksData.map((d) => ({
    name: d.name,
    Created: d.created,
    Completed: d.completed,
  }));

  return (
    <ReportPageLayout
      title={t("activity.title")}
      description={t("activity.description")}
      category="activity"
      currentFilters={params.toString()}
    >
      <Paper variant="outlined" sx={{ p: 3 }}>
        <Typography variant="body2" color="text.secondary">{t("activity.overdueTasks")}</Typography>
        <Typography variant="h5" color="error.main" sx={{ mt: 1, fontWeight: 600 }}>{overdue}</Typography>
      </Paper>
      <ReportChart
        data={taskChartData as never}
        titleKey="tasksCreatedCompleted"
        type="bar"
        categories={["Created", "Completed"]}
      />
      <ReportChart data={tasksByAssignee} titleKey="tasksByAssignee" type="bar" />
      <ReportChart data={activitiesByType} titleKey="activitiesByType" type="bar" />
    </ReportPageLayout>
  );
}
