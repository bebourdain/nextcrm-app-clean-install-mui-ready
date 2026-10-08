"use client";

import { useState } from "react";
import { Add, Close } from "@mui/icons-material";
import { Box, Button, Checkbox, FormControlLabel, IconButton, Paper, Stack, TextField, Typography } from "@mui/material";
import type { EnrichmentField } from "@/lib/enrichment/types";

const PRESET_FIELDS: EnrichmentField[] = [
  { name: "position", displayName: "Position / Job Title", description: "The contact's job title or role at their company", type: "string", required: false },
  { name: "website", displayName: "Company Website", description: "The company's official website URL", type: "string", required: false },
  { name: "social_linkedin", displayName: "LinkedIn URL", description: "The contact's or company's LinkedIn profile URL", type: "string", required: false },
  { name: "social_twitter", displayName: "Twitter / X URL", description: "The contact's or company's Twitter/X profile URL", type: "string", required: false },
  { name: "social_facebook", displayName: "Facebook URL", description: "The contact's or company's Facebook page URL", type: "string", required: false },
  { name: "social_instagram", displayName: "Instagram URL", description: "The contact's or company's Instagram profile URL", type: "string", required: false },
  { name: "description", displayName: "Company Description", description: "A brief description of what the company does", type: "string", required: false },
  { name: "office_phone", displayName: "Office Phone", description: "The company or contact's office phone number", type: "string", required: false },
  { name: "mobile_phone", displayName: "Mobile Phone", description: "The contact's mobile phone number", type: "string", required: false },
];
interface Props {
  onStart: (fields: EnrichmentField[]) => void;
  loading?: boolean;
  presetFields?: EnrichmentField[];
  defaultSelected?: string[];
}

export function EnrichFieldSelector({ onStart, loading, presetFields = PRESET_FIELDS, defaultSelected = ["position", "social_linkedin", "website", "description"] }: Props) {
  const [selected, setSelected] = useState<Set<string>>(new Set(defaultSelected));
  const [customFields, setCustomFields] = useState<EnrichmentField[]>([]);
  const [customName, setCustomName] = useState("");
  const [customDesc, setCustomDesc] = useState("");
  const toggle = (name: string) => setSelected((previous) => {
    const next = new Set(previous);
    next.has(name) ? next.delete(name) : next.add(name);
    return next;
  });
  const addCustom = () => {
    if (!customName.trim()) return;
    const field: EnrichmentField = {
      name: customName.toLowerCase().replace(/\s+/g, "_"),
      displayName: customName.trim(),
      description: customDesc.trim() || `Find the ${customName.trim()} for this contact`,
      type: "string", required: false,
    };
    setCustomFields((previous) => [...previous, field]);
    setSelected((previous) => new Set(previous).add(field.name));
    setCustomName(""); setCustomDesc("");
  };
  const removeCustom = (name: string) => {
    setCustomFields((previous) => previous.filter((field) => field.name !== name));
    setSelected((previous) => { const next = new Set(previous); next.delete(name); return next; });
  };
  const selectedFields = [...presetFields, ...customFields].filter((field) => selected.has(field.name));

  return <Stack spacing={2}>
    <Typography variant="body2" color="text.secondary">Select the data points to enrich. Firecrawl will search the web to find them.</Typography>
    <Box>
      {presetFields.map((field) => <FormControlLabel key={field.name} sx={{ display: "flex", m: 0 }} label={field.displayName} control={<Checkbox size="small" checked={selected.has(field.name)} onChange={() => toggle(field.name)} />} />)}
      {customFields.map((field) => <Stack key={field.name} direction="row" sx={{ alignItems: "center" }}>
        <FormControlLabel sx={{ flex: 1, m: 0 }} label={field.displayName} control={<Checkbox size="small" checked={selected.has(field.name)} onChange={() => toggle(field.name)} />} />
        <IconButton size="small" aria-label={`Remove ${field.displayName}`} onClick={() => removeCustom(field.name)}><Close fontSize="small" /></IconButton>
      </Stack>)}
    </Box>
    <Paper variant="outlined" sx={{ p: 2, bgcolor: "action.hover" }}><Stack spacing={1}>
      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>Add custom field</Typography>
      <TextField size="small" placeholder="Field name (e.g. Number of employees)" value={customName} onChange={(event) => setCustomName(event.target.value)} fullWidth />
      <TextField size="small" placeholder="Description (optional)" value={customDesc} onChange={(event) => setCustomDesc(event.target.value)} fullWidth />
      <Box><Button size="small" variant="outlined" startIcon={<Add />} onClick={addCustom} disabled={!customName.trim()}>Add field</Button></Box>
    </Stack></Paper>
    <Button variant="contained" fullWidth disabled={!selectedFields.length || loading} onClick={() => onStart(selectedFields)}>{loading ? "Starting…" : `Start Enrichment (${selectedFields.length} fields)`}</Button>
  </Stack>;
}
