"use client";

import { useEffect, useState } from "react";
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, MenuItem, Stack, TextField } from "@mui/material";
import { useTranslations } from "next-intl";
import { createSchedule } from "@/actions/reports/schedule";
import { loadConfigs } from "@/actions/reports/config";
import type { ExportFormat, ReportCategory } from "@/actions/reports/types";

const FREQUENCY_CRON: Record<string, string> = { daily: "0 9 * * *", weekly_mon: "0 9 * * 1", weekly_fri: "0 9 * * 5", monthly: "0 9 1 * *" };
type Config = { id: string; name: string; category: string };

export function ScheduleDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const t = useTranslations("ReportsPage.scheduleDialog");
  const [configs, setConfigs] = useState<Config[]>([]);
  const [selectedConfigId, setSelectedConfigId] = useState("");
  const [frequency, setFrequency] = useState("weekly_mon");
  const [customCron, setCustomCron] = useState("");
  const [recipients, setRecipients] = useState("");
  const [format, setFormat] = useState<ExportFormat>("pdf");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    const categories: ReportCategory[] = ["sales", "leads", "accounts", "activity", "campaigns", "users"];
    Promise.all(categories.map(loadConfigs)).then((results) => setConfigs(results.flat() as Config[]));
  }, [open]);

  const handleCreate = async () => {
    if (!selectedConfigId || !recipients.trim()) return;
    setLoading(true);
    try {
      const cronExpression = frequency === "custom" ? customCron : FREQUENCY_CRON[frequency];
      await createSchedule({ reportConfigId: selectedConfigId, cronExpression, recipients: recipients.split(",").map((email) => email.trim()), format });
      onOpenChange(false);
    } finally { setLoading(false); }
  };

  return <Dialog open={open} onClose={() => onOpenChange(false)} fullWidth maxWidth="sm">
    <DialogTitle>{t("title")}</DialogTitle>
    <DialogContent dividers><Stack spacing={2} sx={{ pt: 1 }}>
      <TextField select label={t("savedReport")} value={selectedConfigId} onChange={(event) => setSelectedConfigId(event.target.value)} fullWidth>
        {configs.map((config) => <MenuItem key={config.id} value={config.id}>{config.name} ({config.category})</MenuItem>)}
      </TextField>
      <TextField select label={t("frequency")} value={frequency} onChange={(event) => setFrequency(event.target.value)} fullWidth>
        <MenuItem value="daily">{t("daily")}</MenuItem><MenuItem value="weekly_mon">{t("weeklyMon")}</MenuItem><MenuItem value="weekly_fri">{t("weeklyFri")}</MenuItem><MenuItem value="monthly">{t("monthly")}</MenuItem><MenuItem value="custom">{t("custom")}</MenuItem>
      </TextField>
      {frequency === "custom" && <TextField label={t("cronExpression")} value={customCron} onChange={(event) => setCustomCron(event.target.value)} placeholder="0 9 * * 1" fullWidth />}
      <TextField label={t("recipients")} value={recipients} onChange={(event) => setRecipients(event.target.value)} placeholder={t("recipientsPlaceholder")} fullWidth />
      <TextField select label={t("format")} value={format} onChange={(event) => setFormat(event.target.value as ExportFormat)} fullWidth>
        <MenuItem value="csv">CSV</MenuItem><MenuItem value="pdf">PDF</MenuItem><MenuItem value="both">{t("both")}</MenuItem>
      </TextField>
    </Stack></DialogContent>
    <DialogActions><Button onClick={() => onOpenChange(false)}>{t("cancel")}</Button><Button variant="contained" onClick={handleCreate} disabled={loading || !selectedConfigId || !recipients.trim() || (frequency === "custom" && !customCron.trim())}>{t("create")}</Button></DialogActions>
  </Dialog>;
}
