"use client";

import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, LabelList, Legend, Pie, PieChart, ResponsiveContainer, Tooltip as ChartTooltip, XAxis, YAxis, type TooltipProps } from "recharts";
import { Box, Paper, Stack, Typography, useTheme } from "@mui/material";
import { useTranslations } from "next-intl";
import type { ChartDataPoint } from "@/actions/reports/types";

type Props = {
  data: ChartDataPoint[]; titleKey: string; type?: "bar" | "area" | "pie";
  categories?: string[]; layout?: "vertical" | "horizontal";
};

function MuiChartTooltip({ active, label, payload }: TooltipProps<number | string, string>) {
  if (!active || !payload?.length) return null;

  return <Paper elevation={4} sx={{ p: 1.5, minWidth: 128, border: 1, borderColor: "divider" }}>
    {label != null && <Typography variant="body2" sx={{ mb: 0.5, fontWeight: 600 }}>{label}</Typography>}
    <Stack spacing={0.5}>
      {payload.map((item, index) => <Stack key={`${item.dataKey ?? item.name}-${index}`} direction="row" spacing={1} sx={{ alignItems: "center", justifyContent: "space-between" }}>
        <Typography variant="body2" sx={{ color: item.color || "text.primary" }}>{item.name}</Typography>
        <Typography variant="body2" sx={{ fontWeight: 600 }}>{item.value}</Typography>
      </Stack>)}
    </Stack>
  </Paper>;
}

export function ReportChart({ data, titleKey, type = "bar", categories = ["Number"], layout = "vertical" }: Props) {
  const t = useTranslations("ReportsPage.charts");
  const theme = useTheme();
  const colors = [theme.palette.primary.main, theme.palette.secondary.main, theme.palette.success.main, theme.palette.warning.main, theme.palette.info.main];
  const axisColor = theme.palette.text.secondary;
  const showLegend = categories.length > 1;

  return <Paper variant="outlined" sx={{ p: { xs: 2, sm: 3 } }}>
    <Typography variant="h6" sx={{ mb: 2 }}>{t(titleKey)}</Typography>
    {!data?.length ? <Box sx={{ height: 288, display: "grid", placeItems: "center" }}><Typography color="text.secondary">{t("noData")}</Typography></Box> :
      <Box sx={{ height: 288, width: "100%" }}><ResponsiveContainer width="100%" height="100%">
        {type === "bar" ? <BarChart data={data} layout={layout === "horizontal" ? "vertical" : "horizontal"} margin={{ left: 12, right: 12 }}>
          <CartesianGrid vertical={false} stroke={theme.palette.divider} />
          {layout === "horizontal" ? <><YAxis dataKey="name" type="category" tickLine={false} axisLine={false} width={100} tick={{ fill: axisColor }} /><XAxis type="number" tickLine={false} axisLine={false} tick={{ fill: axisColor }} /></> : <><XAxis dataKey="name" tickLine={false} axisLine={false} tickMargin={8} tick={{ fill: axisColor }} /><YAxis tickLine={false} axisLine={false} width={48} tick={{ fill: axisColor }} /></>}
          <ChartTooltip content={<MuiChartTooltip />} />{showLegend && <Legend />}
          {categories.map((category, index) => <Bar key={category} dataKey={category} fill={colors[index % colors.length]} radius={[4, 4, 0, 0]} />)}
        </BarChart> : type === "area" ? <AreaChart data={data} margin={{ left: 12, right: 12 }}>
          <CartesianGrid vertical={false} stroke={theme.palette.divider} /><XAxis dataKey="name" tickLine={false} axisLine={false} tickMargin={8} tick={{ fill: axisColor }} /><YAxis tickLine={false} axisLine={false} width={48} tick={{ fill: axisColor }} />
          <ChartTooltip content={<MuiChartTooltip />} />{showLegend && <Legend />}
          {categories.map((category, index) => <Area key={category} dataKey={category} type="monotone" fill={colors[index % colors.length]} fillOpacity={0.2} stroke={colors[index % colors.length]} strokeWidth={2} />)}
        </AreaChart> : <PieChart>
          <ChartTooltip content={<MuiChartTooltip />} />
          <Pie data={data} dataKey="Number" nameKey="name" cx="50%" cy="50%" innerRadius={60} outerRadius={100} strokeWidth={2}>
            {data.map((_, index) => <Cell key={index} fill={colors[index % colors.length]} />)}
            <LabelList dataKey="name" position="outside" fill={axisColor} />
          </Pie><Legend />
        </PieChart>}
      </ResponsiveContainer></Box>}
  </Paper>;
}
