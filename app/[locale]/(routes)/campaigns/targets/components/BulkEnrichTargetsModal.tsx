"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogTitle, Typography } from "@mui/material";
import { toast } from "sonner";
import { EnrichFieldSelector } from "./EnrichFieldSelector";
import type { EnrichmentField } from "@/lib/enrichment/types";
import { ALL_TARGET_PRESET_FIELDS } from "@/lib/enrichment/presets/target-fields";
import { NoApiKeyDialog } from "@/app/components/NoApiKeyDialog";

export function BulkEnrichTargetsModal({ targetIds, open, onOpenChange }: { targetIds: string[]; open: boolean; onOpenChange: (open: boolean) => void }) {
  const [loading, setLoading] = useState(false);
  const [showNoApiKeyDialog, setShowNoApiKeyDialog] = useState(false);
  const handleStart = async (fields: EnrichmentField[]) => {
    setLoading(true);
    try {
      const res = await fetch("/api/campaigns/targets/enrich-bulk", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ targetIds, fields }) });
      if (res.ok) { toast.success(`Enrichment started for ${targetIds.length} targets. Check the Enrichment Jobs page for progress.`); onOpenChange(false); }
      else {
        const error = await res.json();
        if (res.status === 402 || error.error === "NO_API_KEY") setShowNoApiKeyDialog(true);
        else toast.error(error.error ?? "Failed to start bulk enrichment");
      }
    } finally { setLoading(false); }
  };
  return <>
    <Dialog open={open} onClose={() => onOpenChange(false)} fullWidth maxWidth="sm">
      <DialogTitle>Enrich {targetIds.length} targets</DialogTitle>
      <DialogContent dividers>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>Select fields to enrich. Firecrawl will run in the background. Only empty fields will be filled — existing data is never overwritten.</Typography>
        <EnrichFieldSelector onStart={handleStart} loading={loading} presetFields={ALL_TARGET_PRESET_FIELDS} defaultSelected={["position", "company", "social_linkedin", "company_website"]} />
      </DialogContent>
    </Dialog>
    <NoApiKeyDialog open={showNoApiKeyDialog} onClose={() => setShowNoApiKeyDialog(false)} />
  </>;
}
