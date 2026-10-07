"use client";

import { useState } from "react";
import { Box, Button } from "@mui/material";
import { Download, FileText, Save, Clock } from "lucide-react";
import { useTranslations } from "next-intl";
import { SaveConfigDialog } from "./SaveConfigDialog";
import { ScheduleDialog } from "./ScheduleDialog";
import type { ReportCategory } from "@/actions/reports/types";

export function ReportToolbar({ category, currentFilters }: { category: ReportCategory; currentFilters: string }) {
  const t = useTranslations("ReportsPage.toolbar");
  const [showSave, setShowSave] = useState(false);
  const [showSchedule, setShowSchedule] = useState(false);

  const handleExport = async (format: "csv" | "pdf") => {
    const response = await fetch(`/api/reports/export?category=${category}&format=${format}&${currentFilters}`);
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${category}-report.${format}`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
    <Button variant="outlined" size="small" startIcon={<Download size={16} />} onClick={() => handleExport("csv")}>{t("exportCSV")}</Button>
    <Button variant="outlined" size="small" startIcon={<FileText size={16} />} onClick={() => handleExport("pdf")}>{t("exportPDF")}</Button>
    <Button variant="outlined" size="small" startIcon={<Save size={16} />} onClick={() => setShowSave(true)}>{t("saveConfig")}</Button>
    <Button variant="outlined" size="small" startIcon={<Clock size={16} />} onClick={() => setShowSchedule(true)}>{t("schedule")}</Button>
    <SaveConfigDialog open={showSave} onOpenChange={setShowSave} category={category} currentFilters={currentFilters} />
    <ScheduleDialog open={showSchedule} onOpenChange={setShowSchedule} />
  </Box>;
}
