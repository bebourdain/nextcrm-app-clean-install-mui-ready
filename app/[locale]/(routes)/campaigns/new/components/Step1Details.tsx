"use client";
import { useState } from "react";
import { Box, Button, Stack, TextField } from "@mui/material";

type Props = {
  initialData: { name?: string; description?: string; from_name?: string; reply_to?: string };
  onNext: (data: { name: string; description?: string; from_name?: string; reply_to?: string }) => void;
};

export function Step1Details({ initialData, onNext }: Props) {
  const [name, setName] = useState(initialData.name ?? "");
  const [description, setDescription] = useState(initialData.description ?? "");
  const [fromName, setFromName] = useState(initialData.from_name ?? "");
  const [replyTo, setReplyTo] = useState(initialData.reply_to ?? "");
  const [error, setError] = useState("");
  const handleNext = () => {
    if (!name.trim()) { setError("Campaign name is required"); return; }
    onNext({ name: name.trim(), description: description || undefined, from_name: fromName || undefined, reply_to: replyTo || undefined });
  };
  return <Stack spacing={2.5} sx={{ maxWidth: 600 }}>
    <TextField label="Campaign Name *" value={name} onChange={(event) => { setName(event.target.value); setError(""); }} placeholder="e.g. Q2 Product Outreach" error={!!error} helperText={error} />
    <TextField label="Description" value={description} onChange={(event) => setDescription(event.target.value)} placeholder="Optional description..." multiline rows={3} />
    <TextField label="From Name" value={fromName} onChange={(event) => setFromName(event.target.value)} placeholder="e.g. Jane from Acme" />
    <TextField label="Reply-to Email" value={replyTo} onChange={(event) => setReplyTo(event.target.value)} placeholder="reply@yourcompany.com" />
    <Box sx={{ display: "flex", justifyContent: "flex-end" }}><Button variant="contained" onClick={handleNext}>Next →</Button></Box>
  </Stack>;
}
