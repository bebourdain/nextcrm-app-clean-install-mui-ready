"use client";

import { Chip } from "@mui/material";

const STATUS_COLORS: Record<string, "default" | "primary" | "secondary" | "success" | "warning" | "error" | "info"> = {
  DRAFT: "default", ISSUED: "info", SENT: "primary", PARTIALLY_PAID: "warning", PAID: "success",
  OVERDUE: "error", CANCELLED: "default", DISPUTED: "warning", REFUNDED: "secondary", WRITTEN_OFF: "default",
};
const STATUS_LABELS: Record<string, string> = {
  DRAFT: "Draft", ISSUED: "Issued", SENT: "Sent", PARTIALLY_PAID: "Partially Paid", PAID: "Paid",
  OVERDUE: "Overdue", CANCELLED: "Cancelled", DISPUTED: "Disputed", REFUNDED: "Refunded", WRITTEN_OFF: "Written Off",
};

export function StatusBadge({ status, labels }: { status: string; labels?: Record<string, string> }) {
  return <Chip size="small" variant="outlined" color={STATUS_COLORS[status] ?? "default"} label={labels?.[status] ?? STATUS_LABELS[status] ?? status} sx={status === "CANCELLED" ? { textDecoration: "line-through" } : undefined} />;
}
