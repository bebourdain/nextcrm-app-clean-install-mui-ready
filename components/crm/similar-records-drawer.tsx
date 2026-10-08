"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import { Box, Button, Chip, Divider, Drawer, Skeleton, Stack, Typography } from "@mui/material";
import { getSimilarAccounts } from "@/actions/crm/similarity/get-similar-accounts";
import { getSimilarContacts } from "@/actions/crm/similarity/get-similar-contacts";
import { getSimilarLeads } from "@/actions/crm/similarity/get-similar-leads";
import { getSimilarOpportunities } from "@/actions/crm/similarity/get-similar-opportunities";
import type { SimilarityResult, SimilarRecord } from "@/actions/crm/similarity/get-similar-accounts";

type EntityType = "account" | "contact" | "lead" | "opportunity";
const ENTITY_LABELS: Record<EntityType, string> = { account: "Accounts", contact: "Contacts", lead: "Leads", opportunity: "Opportunities" };

async function fetchSimilar(entityType: EntityType, recordId: string): Promise<SimilarityResult> {
  switch (entityType) {
    case "account": return getSimilarAccounts(recordId);
    case "contact": return getSimilarContacts(recordId);
    case "lead": return getSimilarLeads(recordId);
    case "opportunity": return getSimilarOpportunities(recordId);
  }
}

interface SimilarRecordsDrawerProps { entityType: EntityType; recordId: string; open: boolean; onOpenChange: (open: boolean) => void }

export function SimilarRecordsDrawer({ entityType, recordId, open, onOpenChange }: SimilarRecordsDrawerProps) {
  const router = useRouter();
  const locale = useLocale();
  const [result, setResult] = useState<SimilarityResult | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    startTransition(async () => {
      const nextResult = await fetchSimilar(entityType, recordId);
      if (!cancelled) setResult(nextResult);
    });
    return () => { cancelled = true; };
  }, [open, entityType, recordId]);

  const retry = () => {
    setResult(null);
    startTransition(async () => setResult(await fetchSimilar(entityType, recordId)));
  };

  const label = ENTITY_LABELS[entityType];
  return <Drawer anchor="right" open={open} onClose={() => onOpenChange(false)} slotProps={{ paper: { sx: { width: { xs: "100%", sm: 480 }, maxWidth: "100%" } } }}>
    <Box sx={{ p: 3 }}><Typography variant="h6">Similar {label}</Typography></Box>
    <Divider />
    <Stack spacing={1} sx={{ p: 2, overflowY: "auto" }}>
      {isPending && [1, 2, 3].map((index) => <Skeleton key={index} variant="rounded" height={56} />)}
      {!isPending && result?.status === "no_embedding" && <Typography variant="body2" color="text.secondary" align="center" sx={{ py: 3 }}>Still generating similarity data. Check back shortly.</Typography>}
      {!isPending && result?.status === "error" && <Stack spacing={1} sx={{ alignItems: "center", py: 3 }}><Typography variant="body2" color="error">Failed to load similar records.</Typography><Button size="small" variant="outlined" onClick={retry}>Retry</Button></Stack>}
      {!isPending && result?.status === "ok" && result.records.length === 0 && <Typography variant="body2" color="text.secondary" align="center" sx={{ py: 3 }}>No similar {label.toLowerCase()} found yet.</Typography>}
      {!isPending && result?.status === "ok" && result.records.map((record: SimilarRecord) => <Button key={record.id} variant="outlined" fullWidth onClick={() => { onOpenChange(false); router.push(`/${locale}${record.href}`); }} sx={{ justifyContent: "space-between", textAlign: "left", textTransform: "none", p: 1.5, color: "text.primary", borderColor: "divider" }}>
        <Box sx={{ minWidth: 0 }}><Typography variant="body2" sx={{ fontWeight: 600 }} noWrap>{record.name}</Typography>{record.subtitle && <Typography variant="caption" color="text.secondary" noWrap>{record.subtitle}</Typography>}</Box>
        <Chip size="small" color={record.similarity >= 0.8 ? "primary" : record.similarity >= 0.6 ? "default" : "default"} variant={record.similarity >= 0.8 ? "filled" : "outlined"} label={`${Math.round(record.similarity * 100)}% match`} />
      </Button>)}
    </Stack>
  </Drawer>;
}
