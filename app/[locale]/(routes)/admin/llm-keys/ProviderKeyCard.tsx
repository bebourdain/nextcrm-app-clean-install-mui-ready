"use client";

import { useState, useTransition } from "react";
import type { ApiKeyProvider } from "@prisma/client";
import type { ProviderStatus } from "../actions/api-keys";
import { upsertSystemApiKey, deleteSystemApiKey } from "../actions/api-keys";
import { Button, Chip, Paper, Stack, TextField, Typography } from "@mui/material";
import { toast } from "sonner";

const PROVIDER_META: Record<ApiKeyProvider, { name: string; subtitle: string; envVar: string }> = {
  OPENAI: { name: "OpenAI", subtitle: "GPT-4 · Embeddings", envVar: "OPENAI_API_KEY" },
  FIRECRAWL: { name: "Firecrawl", subtitle: "Web scraping", envVar: "FIRECRAWL_API_KEY" },
  ANTHROPIC: { name: "Anthropic", subtitle: "Claude models", envVar: "ANTHROPIC_API_KEY" },
  GROQ: { name: "Groq", subtitle: "Fast inference", envVar: "GROQ_API_KEY" },
};

export function ProviderKeyCard({ status }: { status: ProviderStatus }) {
  const [editing, setEditing] = useState(false);
  const [keyValue, setKeyValue] = useState("");
  const [pending, startTransition] = useTransition();
  const meta = PROVIDER_META[status.provider];
  function save() {
    if (!keyValue.trim()) return;
    startTransition(async () => {
      try { await upsertSystemApiKey(status.provider, keyValue.trim()); setKeyValue(""); setEditing(false); toast.success(`${meta.name} key saved`); }
      catch { toast.error("Failed to save key"); }
    });
  }
  function remove() {
    startTransition(async () => {
      try { await deleteSystemApiKey(status.provider); toast.success(`${meta.name} key removed`); }
      catch { toast.error("Failed to remove key"); }
    });
  }
  function cancel() { setEditing(false); setKeyValue(""); }
  const isEnv = status.source === "ENV_ACTIVE";
  const isSet = status.source === "SYSTEM_SET";
  const isNotConfigured = status.source === "NOT_CONFIGURED";
  return <Paper variant="outlined" sx={{ p: 2.5, borderStyle: isNotConfigured ? "dashed" : "solid" }}><Stack direction="row" spacing={2} sx={{ justifyContent: "space-between", alignItems: "flex-start" }}><Stack><Typography variant="subtitle1" sx={{ fontWeight: 600 }}>{meta.name}</Typography><Typography variant="caption" color="text.secondary">{meta.subtitle}</Typography></Stack>{isEnv ? <Chip size="small" color="warning" variant="outlined" label="ENV active" /> : isSet ? <Chip size="small" color="success" variant="outlined" label="System-wide" /> : <Chip size="small" variant="outlined" label="Not configured" />}</Stack><Stack spacing={1.5} sx={{ mt: 2 }}>{status.maskedKey && <Typography variant="body2" color="text.secondary" sx={{ fontFamily: "monospace" }}>{status.maskedKey}</Typography>}{isEnv && <Typography variant="caption" color="text.secondary">Set via <code>{meta.envVar}</code> — read-only</Typography>}{isSet && !editing && <Stack direction="row" spacing={1}><Button size="small" variant="outlined" onClick={() => setEditing(true)} disabled={pending}>Edit</Button><Button size="small" color="error" onClick={remove} disabled={pending}>Remove</Button></Stack>}{isNotConfigured && !editing && <Button size="small" variant="outlined" onClick={() => setEditing(true)} disabled={pending} sx={{ alignSelf: "flex-start" }}>+ Add key</Button>}{editing && <Stack direction="row" spacing={1}><TextField type="password" size="small" placeholder="Paste API key…" value={keyValue} onChange={(event) => setKeyValue(event.target.value)} autoFocus onKeyDown={(event) => { if (event.key === "Enter") save(); if (event.key === "Escape") cancel(); }} sx={{ flex: 1 }} /><Button size="small" variant="contained" onClick={save} disabled={pending || !keyValue.trim()}>Save</Button><Button size="small" onClick={cancel} disabled={pending}>Cancel</Button></Stack>}</Stack></Paper>;
}
