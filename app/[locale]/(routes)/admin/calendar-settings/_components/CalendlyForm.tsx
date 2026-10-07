"use client";

import { useState, useTransition } from "react";
import { Button, Divider, Paper, Stack, TextField, Typography } from "@mui/material";
import { toast } from "sonner";
import { saveCalendlyAction, subscribeCalendlyWebhook } from "../_actions/calendly";

export function CalendlyForm(props: { hasToken: boolean; hasSigningKey: boolean; webhookUri: string | null }) {
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);
  const [savePending, startSaveTransition] = useTransition();
  function handleSave(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    startSaveTransition(async () => {
      const result = await saveCalendlyAction(formData);
      if (result.ok) toast.success("Calendly settings saved.");
      else toast.error(result.error ?? "Failed to save Calendly settings.");
    });
  }
  function subscribe() {
    startTransition(async () => {
      const result = await subscribeCalendlyWebhook();
      setMessage(result.ok ? "Webhook subscribed." : result.error ?? "Failed.");
    });
  }
  return <Paper variant="outlined" sx={{ p: 3, maxWidth: 580 }}><Stack component="form" onSubmit={handleSave} spacing={2}><TextField name="apiToken" type="password" label={`API token ${props.hasToken ? "(saved)" : ""}`} placeholder="Calendly personal access token" fullWidth /><TextField name="signingKey" type="password" label={`Webhook signing key ${props.hasSigningKey ? "(saved)" : ""}`} placeholder="Webhook signing key" fullWidth /><Button type="submit" variant="contained" disabled={savePending} sx={{ alignSelf: "flex-start" }}>{savePending ? "Saving..." : "Save"}</Button></Stack><Divider sx={{ my: 3 }} /><Button variant="outlined" disabled={pending || !props.hasToken} onClick={subscribe}>{props.webhookUri ? "Re-subscribe webhook" : "Subscribe webhook"}</Button>{props.webhookUri && <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 1, overflowWrap: "anywhere" }}>Active subscription: {props.webhookUri}</Typography>}{message && <Typography variant="body2" sx={{ mt: 1 }}>{message}</Typography>}</Paper>;
}
