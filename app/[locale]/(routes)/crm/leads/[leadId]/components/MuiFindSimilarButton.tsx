"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import { X } from "lucide-react";
import { Box, Button, Chip, Divider, Drawer, IconButton, Skeleton, Stack, Typography } from "@mui/material";
import { getSimilarLeads } from "@/actions/crm/similarity/get-similar-leads";
import type { SimilarityResult } from "@/actions/crm/similarity/get-similar-accounts";

export function MuiFindSimilarButton({ recordId }: { recordId: string }) {
  const router = useRouter();
  const locale = useLocale();
  const [open, setOpen] = useState(false);
  const [result, setResult] = useState<SimilarityResult | null>(null);
  const [isPending, startTransition] = useTransition();

  const load = () => {
    setResult(null);
    startTransition(async () => setResult(await getSimilarLeads(recordId)));
  };

  const show = () => {
    setOpen(true);
    load();
  };

  return (
    <>
      <Button variant="outlined" size="small" onClick={show} sx={{ justifySelf: "start" }}>Find Similar</Button>
      <Drawer anchor="bottom" open={open} onClose={() => setOpen(false)} slotProps={{ paper: { sx: { maxHeight: "80vh", borderTopLeftRadius: 2, borderTopRightRadius: 2 } } }}>
        <Box sx={{ width: "100%", maxWidth: 760, mx: "auto", overflowY: "auto" }}>
          <Stack direction="row" sx={{ p: 2, alignItems: "center", justifyContent: "space-between" }}>
            <Typography variant="h6">Similar Leads</Typography>
            <IconButton aria-label="Close" onClick={() => setOpen(false)}><X size={18} /></IconButton>
          </Stack>
          <Divider />
          <Box sx={{ p: 2, display: "grid", gap: 1 }}>
            {isPending && [1, 2, 3].map((index) => <Skeleton key={index} variant="rounded" height={56} />)}
            {!isPending && result?.status === "no_embedding" && <Typography variant="body2" color="text.secondary" sx={{ py: 2, textAlign: "center" }}>Still generating similarity data. Check back shortly.</Typography>}
            {!isPending && result?.status === "error" && (
              <Stack spacing={1} sx={{ py: 2, alignItems: "center" }}>
                <Typography variant="body2" color="error">Failed to load similar records.</Typography>
                <Button variant="outlined" size="small" onClick={load}>Retry</Button>
              </Stack>
            )}
            {!isPending && result?.status === "ok" && result.records.length === 0 && <Typography variant="body2" color="text.secondary" sx={{ py: 2, textAlign: "center" }}>No similar leads found yet.</Typography>}
            {!isPending && result?.status === "ok" && result.records.map((record) => (
              <Button
                key={record.id}
                variant="outlined"
                onClick={() => { setOpen(false); router.push(`/${locale}${record.href}`); }}
                sx={{ width: "100%", justifyContent: "space-between", textAlign: "left", color: "text.primary", p: 1.5, gap: 2 }}
              >
                <Box sx={{ minWidth: 0 }}>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>{record.name}</Typography>
                  {record.subtitle && <Typography variant="caption" color="text.secondary">{record.subtitle}</Typography>}
                </Box>
                <Chip size="small" color={record.similarity >= 0.8 ? "primary" : "default"} variant={record.similarity >= 0.6 ? "filled" : "outlined"} label={`${Math.round(record.similarity * 100)}% match`} />
              </Button>
            ))}
          </Box>
        </Box>
      </Drawer>
    </>
  );
}
