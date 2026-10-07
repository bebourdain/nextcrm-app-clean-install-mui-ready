"use client";

import { Box, Stack, Typography } from "@mui/material";

interface Activity { id: string; action: string; meta: Record<string, unknown> | null; createdAt: string }
const ACTION_LABELS: Record<string, string> = {
  CREATED: "Invoice created", ISSUED: "Invoice issued", SENT: "Invoice sent by email", PAYMENT_ADDED: "Payment recorded",
  PAYMENT_DELETED: "Payment deleted", CANCELLED: "Invoice cancelled", DUPLICATED: "Invoice duplicated", UPDATED: "Invoice updated", STATUS_CHANGED: "Status changed",
};
export function ActivityLog({ activities }: { activities: Activity[] }) {
  if (!activities.length) return <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>No activity yet</Typography>;
  return <Stack spacing={2}>{activities.map((activity) => <Stack key={activity.id} direction="row" spacing={1.5} sx={{ alignItems: "flex-start" }}>
    <Box sx={{ width: 8, height: 8, mt: 0.75, borderRadius: "50%", bgcolor: "primary.main", flexShrink: 0 }} />
    <Box><Typography variant="body2" sx={{ fontWeight: 600 }}>{ACTION_LABELS[activity.action] ?? activity.action}</Typography><Typography variant="caption" color="text.secondary">{new Date(activity.createdAt).toLocaleString()}</Typography></Box>
  </Stack>)}</Stack>;
}
