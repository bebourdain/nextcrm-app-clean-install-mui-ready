"use client";

import { Card, CardContent, LinearProgress, Stack, Typography } from "@mui/material";
import { Database } from "lucide-react";

export default function StorageQuota({ actual, title }: { actual: number; title: string }) {
  const percent = parseFloat((100 * (actual / 2000)).toFixed(2));
  return <Card variant="outlined" sx={{ height: "100%" }}><CardContent>
    <Stack direction="row" sx={{ justifyContent: "space-between", alignItems: "center", mb: 1.5 }}>
      <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>{title}</Typography>
      <Database size={18} />
    </Stack>
    <Typography variant="h5" sx={{ fontWeight: 700 }}>{actual}/MB</Typography>
    <Stack direction="row" sx={{ justifyContent: "space-between", mt: 2, mb: 1 }}>
      <Typography variant="caption" color="text.secondary">{percent}% ({actual}MB)</Typography>
      <Typography variant="caption" color="text.secondary">2000MB</Typography>
    </Stack>
    <LinearProgress variant="determinate" value={Math.min(Math.max(percent, 0), 100)} color="warning" />
  </CardContent></Card>;
}
