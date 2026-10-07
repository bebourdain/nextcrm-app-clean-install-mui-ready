"use client";

import { useState } from "react";
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, FormControlLabel, Stack, Switch, TextField } from "@mui/material";
import { useTranslations } from "next-intl";
import { saveConfig } from "@/actions/reports/config";
import type { ReportCategory } from "@/actions/reports/types";

export function SaveConfigDialog({ open, onOpenChange, category, currentFilters }: { open: boolean; onOpenChange: (open: boolean) => void; category: ReportCategory; currentFilters: string }) {
  const t = useTranslations("ReportsPage.saveDialog");
  const [name, setName] = useState("");
  const [isShared, setIsShared] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!name.trim()) return;
    setLoading(true);
    try {
      const filters = Object.fromEntries(new URLSearchParams(currentFilters));
      await saveConfig({ name: name.trim(), category, filters, isShared });
      setName(""); setIsShared(false); onOpenChange(false);
    } finally { setLoading(false); }
  };

  return <Dialog open={open} onClose={() => onOpenChange(false)} fullWidth maxWidth="xs">
    <DialogTitle>{t("title")}</DialogTitle>
    <DialogContent dividers><Stack spacing={2} sx={{ pt: 1 }}>
      <TextField id="config-name" label={t("nameLabel")} value={name} onChange={(event) => setName(event.target.value)} placeholder={t("namePlaceholder")} fullWidth />
      <FormControlLabel label={t("shareLabel")} control={<Switch checked={isShared} onChange={(_, checked) => setIsShared(checked)} />} />
    </Stack></DialogContent>
    <DialogActions><Button onClick={() => onOpenChange(false)}>{t("cancel")}</Button><Button variant="contained" onClick={handleSave} disabled={loading || !name.trim()}>{t("save")}</Button></DialogActions>
  </Dialog>;
}
