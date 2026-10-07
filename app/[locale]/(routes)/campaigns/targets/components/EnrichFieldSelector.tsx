"use client";

import { useState } from "react";
import { Box, Button, Checkbox, FormControlLabel, IconButton, Paper, Stack, TextField, Typography } from "@mui/material";
import { Plus, X } from "lucide-react";
import type { EnrichmentField } from "@/lib/enrichment/types";

interface Props { onStart: (fields: EnrichmentField[]) => void; loading?: boolean; presetFields?: EnrichmentField[]; defaultSelected?: string[] }
export function EnrichFieldSelector({ onStart, loading, presetFields = [], defaultSelected = [] }: Props) {
  const [selected, setSelected] = useState<Set<string>>(new Set(defaultSelected));
  const [customFields, setCustomFields] = useState<EnrichmentField[]>([]);
  const [customName, setCustomName] = useState("");
  const [customDesc, setCustomDesc] = useState("");
  const toggle = (name: string) => setSelected((previous) => { const next = new Set(previous); if (next.has(name)) next.delete(name); else next.add(name); return next; });
  const addCustom = () => {
    if (!customName.trim()) return;
    const field: EnrichmentField = { name: customName.toLowerCase().replace(/\s+/g, "_"), displayName: customName.trim(), description: customDesc.trim() || `Find the ${customName.trim()} for this target`, type: "string", required: false };
    setCustomFields((previous) => [...previous, field]);
    setSelected((previous) => new Set(previous).add(field.name));
    setCustomName(""); setCustomDesc("");
  };
  const removeCustom = (name: string) => { setCustomFields((previous) => previous.filter((field) => field.name !== name)); setSelected((previous) => { const next = new Set(previous); next.delete(name); return next; }); };
  const selectedFields = [...presetFields, ...customFields].filter((field) => selected.has(field.name));
  return <Stack spacing={2}>
    <Typography variant="body2" color="text.secondary">Select the data points to enrich. Firecrawl will search the web to find them.</Typography>
    <Box>{presetFields.map((field) => <FormControlLabel key={field.name} sx={{ display: "flex" }} label={field.displayName} control={<Checkbox checked={selected.has(field.name)} onChange={() => toggle(field.name)} />} />)}
      {customFields.map((field) => <Stack key={field.name} direction="row" sx={{ alignItems: "center" }}>
        <FormControlLabel sx={{ flex: 1 }} label={field.displayName} control={<Checkbox checked={selected.has(field.name)} onChange={() => toggle(field.name)} />} />
        <IconButton size="small" aria-label={`Remove ${field.displayName}`} onClick={() => removeCustom(field.name)}><X size={16} /></IconButton>
      </Stack>)}</Box>
    <Paper variant="outlined" sx={{ p: 2, bgcolor: "action.hover" }}><Stack spacing={1}>
      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>Add custom field</Typography>
      <TextField size="small" placeholder="Field name (e.g. Number of employees)" value={customName} onChange={(event) => setCustomName(event.target.value)} />
      <TextField size="small" placeholder="Description (optional)" value={customDesc} onChange={(event) => setCustomDesc(event.target.value)} />
      <Box><Button variant="outlined" size="small" startIcon={<Plus size={15} />} onClick={addCustom} disabled={!customName.trim()}>Add field</Button></Box>
    </Stack></Paper>
    <Button variant="contained" disabled={!selectedFields.length || loading} onClick={() => onStart(selectedFields)}>{loading ? "Starting…" : `Start Enrichment (${selectedFields.length} fields)`}</Button>
  </Stack>;
}
