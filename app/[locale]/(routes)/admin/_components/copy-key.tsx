"use client";

import { IconButton, Stack, Typography } from "@mui/material";
import { toast } from "sonner";
import { Copy } from "lucide-react";

export default function CopyKeyComponent({ keyValue, envValue, message }: { keyValue?: string; envValue?: string; message: string }) {
  const value = keyValue ?? envValue ?? "Not set";
  function copy() {
    navigator.clipboard.writeText(keyValue || "");
    toast.success(`${message} - copied to clipboard`);
  }
  return <Stack direction="row" spacing={0.5} sx={{ alignItems: "center", minWidth: 0 }}><Typography variant="body2" sx={{ overflowWrap: "anywhere" }}>{value}</Typography><IconButton size="small" aria-label={`Copy ${message}`} onClick={copy}><Copy size={16} /></IconButton></Stack>;
}
