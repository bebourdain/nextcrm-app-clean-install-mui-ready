"use client";

import { useState } from "react";
import { Box, Button, Paper, Stack, TextField, Typography } from "@mui/material";
import { toast } from "sonner";
import type { FunnelTimingSettings } from "@/lib/crm/funnel-timers";
import { updateFunnelSettings } from "../_actions/funnel-settings";

const FIELDS: Array<{ key: keyof FunnelTimingSettings; label: string; group: string }> = [
  { key: "killAfterDays", label: "Close deal after N days of client silence", group: "Kill rule" },
  { key: "recycleAfterDays", label: "Recycle targets N days after sequence end", group: "Recycle" },
  { key: "cadenceTouch1BusinessDays", label: "Touch 1: business days after quote", group: "Follow-up cadence" },
  { key: "cadenceTouch2OffsetDays", label: "Touch 2: days after touch 1", group: "Follow-up cadence" },
  { key: "cadenceTouch3OffsetDays", label: "Touch 3: days after touch 2", group: "Follow-up cadence" },
  { key: "cadenceTouch4OffsetDays", label: "Touch 4: days after touch 3", group: "Follow-up cadence" },
  { key: "cadenceTouch5OffsetDays", label: "Touch 5 (final): days after touch 3", group: "Follow-up cadence" },
  { key: "careCheckinDays", label: "Care check-in after N days", group: "Care & renewals" },
  { key: "careReferralDays", label: "Referral ask after N days", group: "Care & renewals" },
  { key: "careQuarterIntervalDays", label: "Quarterly interval (days)", group: "Care & renewals" },
  { key: "careQuarterCount", label: "Number of quarterly check-ins", group: "Care & renewals" },
  { key: "renewalWindowDays", label: "Surface renewals N days ahead", group: "Care & renewals" },
];

export default function FunnelSettingsForm({ initial }: { initial: FunnelTimingSettings }) {
  const [values, setValues] = useState<FunnelTimingSettings>(initial);
  const [saving, setSaving] = useState(false);
  async function save() {
    setSaving(true);
    try { const result = await updateFunnelSettings(values); if (result.error) toast.error(result.error); else toast.success("Funnel settings saved"); }
    catch { toast.error("Failed to save funnel settings"); }
    finally { setSaving(false); }
  }
  const groups = Array.from(new Set(FIELDS.map((field) => field.group)));
  return <Paper variant="outlined" sx={{ p: 3 }}><Typography variant="h6">Funnel timing — instance settings</Typography><Typography variant="body2" color="text.secondary" sx={{ mt: 1, mb: 3 }}>Changes apply to future stage entries and the next timer runs; already-scheduled cadences keep the timings they started with.</Typography><Stack spacing={3}>{groups.map((group) => <Box key={group}><Typography variant="subtitle2" sx={{ mb: 1 }}>{group}</Typography><Box sx={{ display: "grid", gap: 2, gridTemplateColumns: { xs: "1fr", md: "repeat(2, minmax(0, 1fr))" } }}>{FIELDS.filter((field) => field.group === group).map((field) => <TextField key={field.key} type="number" label={field.label} value={values[field.key]} onChange={(event) => setValues((previous) => ({ ...previous, [field.key]: Number(event.target.value) }))} slotProps={{ htmlInput: { min: 0 } }} size="small" fullWidth />)}</Box></Box>)}<Button variant="contained" onClick={save} disabled={saving} sx={{ alignSelf: "flex-start" }}>{saving ? "Saving…" : "Save settings"}</Button></Stack></Paper>;
}
