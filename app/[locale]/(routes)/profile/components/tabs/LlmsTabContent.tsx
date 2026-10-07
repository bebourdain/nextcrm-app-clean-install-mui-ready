"use client";

import { useState, useTransition } from "react";
import { ApiKeyProvider } from "@prisma/client";
import { Button, Paper, Stack, TextField, Typography } from "@mui/material";
import { toast } from "sonner";
import type { UserProviderStatus } from "../../actions/api-keys";
import { upsertUserApiKey, deleteUserApiKey } from "../../actions/api-keys";

const PROVIDER_META: Record<ApiKeyProvider, { label: string; description: string }> = {
  OPENAI: { label: "OpenAI", description: "Used for GPT-4 enrichment and embeddings" },
  FIRECRAWL: { label: "Firecrawl", description: "Used for web scraping during enrichment" },
  ANTHROPIC: { label: "Anthropic", description: "Claude models" },
  GROQ: { label: "Groq", description: "Fast inference" },
};
function ProviderRow({ status }: { status: UserProviderStatus }) {
  const [value, setValue] = useState("");
  const [pending, startTransition] = useTransition();
  const meta = PROVIDER_META[status.provider];
  const save = () => {
    if (!value.trim()) { toast.error("Please enter an API key."); return; }
    startTransition(async () => {
      try { await upsertUserApiKey(status.provider, value.trim()); toast.success(`${meta.label} API key saved.`); setValue(""); }
      catch { toast.error(`Failed to save ${meta.label} API key.`); }
    });
  };
  const remove = () => startTransition(async () => {
    try { await deleteUserApiKey(status.provider); toast.success(`${meta.label} API key removed.`); }
    catch { toast.error(`Failed to remove ${meta.label} API key.`); }
  });
  return <Paper variant="outlined" sx={{ p: 3 }}>
    <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>{meta.label}</Typography>
    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>{meta.description}</Typography>
    {status.higherTierActive && <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 1 }}>A system-wide key is active — your key is not in use. {status.maskedKey}</Typography>}
    {!status.higherTierActive && status.maskedKey && <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 1 }}>Current key: <code>{status.maskedKey}</code></Typography>}
    <Stack direction={{ xs: "column", sm: "row" }} spacing={1} sx={{ alignItems: { sm: "center" } }}>
      <TextField size="small" type="password" placeholder={`Enter ${meta.label} API key`} value={value} onChange={(event) => setValue(event.target.value)} disabled={pending} sx={{ maxWidth: 400, flex: 1 }} />
      <Button variant="contained" onClick={save} disabled={pending}>Save</Button>
      {status.source === "USER_SET" && <Button variant="outlined" onClick={remove} disabled={pending}>Remove</Button>}
    </Stack>
  </Paper>;
}
export function LlmsTabContent({ initialKeys }: { initialKeys: UserProviderStatus[] }) {
  return <Stack spacing={2}>{initialKeys.map((status) => <ProviderRow key={status.provider} status={status} />)}</Stack>;
}
