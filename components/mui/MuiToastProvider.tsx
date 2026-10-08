"use client";

import { useEffect } from "react";
import { Alert, Box, CircularProgress, Stack } from "@mui/material";
import { toast, useSonner, type ToastT } from "sonner";

function ToastAlert({ item }: { item: ToastT }) {
  useEffect(() => {
    const duration = item.duration ?? (item.type === "loading" ? Infinity : 4000);
    if (!Number.isFinite(duration) || duration <= 0) return;
    const timer = window.setTimeout(() => { item.onAutoClose?.(item); toast.dismiss(item.id); }, duration);
    return () => window.clearTimeout(timer);
  }, [item]);

  const severity = item.type === "error" ? "error" : item.type === "success" ? "success" : item.type === "warning" ? "warning" : "info";
  const title = typeof item.title === "function" ? item.title() : item.title;
  const description = typeof item.description === "function" ? item.description() : item.description;
  return <Alert severity={severity} icon={item.type === "loading" ? <CircularProgress size={18} color="inherit" /> : undefined} onClose={item.dismissible === false ? undefined : () => { item.onDismiss?.(item); toast.dismiss(item.id); }} sx={{ minWidth: { xs: 280, sm: 340 }, maxWidth: 480, boxShadow: 4, alignItems: "center" }}>
    <Box>{title}{description && <Box sx={{ fontSize: 13, opacity: 0.85 }}>{description}</Box>}</Box>
  </Alert>;
}

export function MuiToastProvider() {
  const { toasts } = useSonner();
  return <Stack spacing={1} role="status" aria-live="polite" sx={{ position: "fixed", bottom: 24, right: 24, left: { xs: 24, sm: "auto" }, zIndex: (theme) => theme.zIndex.snackbar, pointerEvents: "none", "& .MuiAlert-root": { pointerEvents: "auto" } }}>
    {toasts.slice(-3).map((item) => <ToastAlert key={item.id} item={item} />)}
  </Stack>;
}
