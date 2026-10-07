"use client";

import { Chip } from "@mui/material";

const STATUS_CONFIG = {
  PENDING: { label: "Pending", color: "default" },
  PROCESSING: { label: "Processing", color: "warning" },
  READY: { label: "Ready", color: "success" },
  FAILED: { label: "Failed", color: "error" },
} as const;

export function ProcessingStatusBadge({ status }: { status: keyof typeof STATUS_CONFIG }) {
  const config = STATUS_CONFIG[status] ?? STATUS_CONFIG.PENDING;
  return <Chip size="small" variant="outlined" color={config.color} label={config.label} />;
}
