"use client";

import Link from "next/link";
import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";
import { Paper, Stack, Typography } from "@mui/material";
import { useTranslations } from "next-intl";
import type { KPIData } from "@/actions/reports/types";

const currencyLocaleMap: Record<string, string> = { EUR: "fr-FR", USD: "en-US", CZK: "cs-CZ", GBP: "en-GB" };
function formatValue(value: number, label: string, currency: string): string {
  if (label === "totalRevenue" || label === "pipelineValue") return new Intl.NumberFormat(currencyLocaleMap[currency] || "en-US", { style: "currency", currency, maximumFractionDigits: 0 }).format(value);
  if (label === "conversionRate") return `${value}%`;
  return new Intl.NumberFormat("en-US").format(value);
}

export function KPICard({ kpi, dateParams, displayCurrency = "USD" }: { kpi: KPIData; dateParams: string; displayCurrency?: string }) {
  const t = useTranslations("ReportsPage.kpi");
  const trendColor = kpi.changePercent > 0 ? "success.main" : kpi.changePercent < 0 ? "error.main" : "text.secondary";
  return <Paper component={Link} href={`${kpi.href}?${dateParams}`} variant="outlined" sx={{ display: "block", p: 2, color: "text.primary", textDecoration: "none", transition: "box-shadow 150ms", "&:hover": { boxShadow: 3 } }}>
    <Stack direction="row" spacing={1} sx={{ justifyContent: "space-between", alignItems: "flex-start" }}>
      <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>{t(kpi.label)}</Typography>
      <Stack direction="row" spacing={0.25} sx={{ alignItems: "center", color: trendColor }}>
        {kpi.changePercent > 0 ? <ArrowUpRight size={16} /> : kpi.changePercent < 0 ? <ArrowDownRight size={16} /> : <Minus size={16} />}
        <Typography variant="caption" sx={{ fontWeight: 600 }}>{Math.abs(kpi.changePercent)}%</Typography>
      </Stack>
    </Stack>
    <Typography variant="h5" sx={{ mt: 2, fontWeight: 600 }}>{formatValue(kpi.value, kpi.label, displayCurrency)}</Typography>
  </Paper>;
}
