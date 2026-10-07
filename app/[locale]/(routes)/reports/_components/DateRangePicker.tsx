"use client";

import { useState } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { CalendarMonth } from "@mui/icons-material";
import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, Stack, TextField } from "@mui/material";
import { useTranslations } from "next-intl";
import { DATE_PRESETS } from "@/actions/reports/types";

const dateString = (date: Date) => date.toISOString().slice(0, 10);

export function DateRangePicker() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const t = useTranslations("ReportsPage");
  const [open, setOpen] = useState(false);
  const [from, setFrom] = useState(searchParams.get("from") ?? "");
  const [to, setTo] = useState(searchParams.get("to") ?? "");

  const applyDates = (nextFrom: string, nextTo: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("from", nextFrom);
    params.set("to", nextTo);
    router.push(`${pathname}?${params.toString()}`);
    setOpen(false);
  };
  const applyPreset = (key: string) => {
    const preset = DATE_PRESETS.find((item) => item.key === key);
    if (!preset) return;
    const range = preset.getRange();
    const nextFrom = dateString(range.from), nextTo = dateString(range.to);
    setFrom(nextFrom); setTo(nextTo);
    applyDates(nextFrom, nextTo);
  };

  return <>
    <Box sx={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: 1 }}>
      {DATE_PRESETS.map((preset) => <Button key={preset.key} variant="outlined" size="small" onClick={() => applyPreset(preset.key)}>{t(preset.labelKey)}</Button>)}
      <Button variant="outlined" size="small" startIcon={<CalendarMonth />} onClick={() => setOpen(true)}>{t("customRange")}</Button>
    </Box>
    <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="xs">
      <DialogTitle>{t("customRange")}</DialogTitle>
      <DialogContent dividers><Stack spacing={2} sx={{ pt: 1 }}>
        <TextField type="date" label={t("from")} value={from} onChange={(event) => setFrom(event.target.value)} slotProps={{ inputLabel: { shrink: true } }} fullWidth />
        <TextField type="date" label={t("to")} value={to} onChange={(event) => setTo(event.target.value)} slotProps={{ inputLabel: { shrink: true } }} fullWidth />
      </Stack></DialogContent>
      <DialogActions><Button onClick={() => setOpen(false)}>Cancel</Button><Button variant="contained" disabled={!from || !to || from > to} onClick={() => applyDates(from, to)}>Apply</Button></DialogActions>
    </Dialog>
  </>;
}
