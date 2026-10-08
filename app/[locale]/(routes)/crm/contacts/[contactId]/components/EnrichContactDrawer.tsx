"use client";

import { useRef, useState } from "react";
import { AutoAwesome, CheckCircleOutlined, Close, OpenInNew } from "@mui/icons-material";
import { Box, Button, Checkbox, Drawer, Link, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from "@mui/material";
import { toast } from "sonner";
import { EnrichFieldSelector } from "../../components/EnrichFieldSelector";
import type { EnrichmentField } from "@/lib/enrichment/types";
import type { StoredEnrichmentResult } from "@/lib/enrichment/types/stored-result";
import { NoApiKeyDialog } from "@/app/components/NoApiKeyDialog";

type Step = "select" | "progress" | "diff";
interface AgentMessage { message: string; type: string; sourceUrl?: string }
interface ContactCurrentData {
  position?: string | null; website?: string | null; social_linkedin?: string | null;
  social_twitter?: string | null; social_facebook?: string | null; social_instagram?: string | null;
  description?: string | null; office_phone?: string | null; mobile_phone?: string | null;
}
interface Props {
  contactId: string; contactEmail: string | null; contactCurrentData: ContactCurrentData;
  open: boolean; onOpenChange: (open: boolean) => void; onApplied: () => void;
}

export function EnrichContactDrawer({ contactId, contactEmail, contactCurrentData, open, onOpenChange, onApplied }: Props) {
  const [step, setStep] = useState<Step>("select");
  const [messages, setMessages] = useState<AgentMessage[]>([]);
  const [result, setResult] = useState<StoredEnrichmentResult | null>(null);
  const [enrichmentId, setEnrichmentId] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [selectedApply, setSelectedApply] = useState<Set<string>>(new Set());
  const [applying, setApplying] = useState(false);
  const [showNoApiKeyDialog, setShowNoApiKeyDialog] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const reset = () => {
    setStep("select"); setMessages([]); setResult(null); setEnrichmentId(null);
    setSessionId(null); setSelectedApply(new Set());
  };
  const handleClose = (nextOpen: boolean) => { if (!nextOpen) reset(); onOpenChange(nextOpen); };
  const handleStart = async (fields: EnrichmentField[]) => {
    setStep("progress"); setMessages([]);
    const response = await fetch("/api/crm/contacts/enrich", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contactId, fields }),
    });
    if (!response.ok) {
      const err = await response.json();
      if (response.status === 402 || err.error === "NO_API_KEY") {
        setShowNoApiKeyDialog(true); setStep("select"); return;
      }
      toast.error(err.error ?? "Failed to start enrichment");
      setStep("select"); return;
    }
    const reader = response.body!.getReader();
    const decoder = new TextDecoder();
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      const chunk = decoder.decode(value);
      for (const line of chunk.split("\n")) {
        if (!line.startsWith("data: ")) continue;
        const event = JSON.parse(line.slice(6));
        if (event.type === "session") {
          setSessionId(event.sessionId);
        } else if (event.type === "agent_progress") {
          setMessages((previous) => [...previous, { message: event.message, type: event.messageType, sourceUrl: event.sourceUrl }]);
          setTimeout(() => scrollRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
        } else if (event.type === "result") {
          setResult(event.result); setEnrichmentId(event.enrichmentId);
          setSelectedApply(new Set(Object.keys(event.result.enrichments)));
        } else if (event.type === "complete") {
          setStep("diff");
        } else if (event.type === "error") {
          toast.error(event.error); setStep("select");
        }
      }
    }
  };
  const handleCancel = async () => {
    if (sessionId) await fetch(`/api/crm/contacts/enrich?sessionId=${sessionId}`, { method: "DELETE" });
    reset();
  };
  const handleApply = async () => {
    if (!result || !enrichmentId) return;
    setApplying(true);
    const updates: Record<string, string> = {};
    for (const [fieldName, enrichment] of Object.entries(result.enrichments)) {
      if (selectedApply.has(fieldName) && enrichment.value) updates[fieldName] = String(enrichment.value);
    }
    const response = await fetch(`/api/crm/contacts/${contactId}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ enrichmentFields: updates }),
    });
    if (response.ok) {
      toast.success("Contact enriched successfully"); onApplied(); handleClose(false);
    } else {
      const err = await response.json(); toast.error(err.error ?? "Failed to apply enrichment");
    }
    setApplying(false);
  };
  const noEmail = !contactEmail;

  return <>
    <Drawer anchor="right" open={open} onClose={() => handleClose(false)} slotProps={{ paper: { sx: { width: { xs: "100%", sm: 560 }, p: 3 } } }}>
      <Stack spacing={1} sx={{ mb: 2 }}>
        <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}><AutoAwesome color="warning" fontSize="small" /><Typography variant="h6">Enrich with AI</Typography></Stack>
        <Typography variant="body2" color="text.secondary">{noEmail ? "Add an email to this contact to enable enrichment." : "Firecrawl searches the web to fill in missing contact details."}</Typography>
      </Stack>
      {noEmail && <Typography color="text.secondary" variant="body2">No email address found on this contact.</Typography>}
      {!noEmail && step === "select" && <EnrichFieldSelector onStart={handleStart} />}
      {step === "progress" && <Stack spacing={2}>
        <Box sx={{ maxHeight: 400, overflowY: "auto" }}>
          {messages.map((message, index) => <Stack key={index} direction="row" spacing={1} sx={{ py: 0.5 }}>
            <Typography variant="body2" color="text.secondary">{message.type === "success" ? "✓" : message.type === "agent" ? "🤖" : "›"}</Typography>
            <Typography variant="body2" sx={{ fontWeight: message.type === "agent" ? 600 : 400 }}>{message.message}
              {message.sourceUrl && <Link href={message.sourceUrl} target="_blank" rel="noopener noreferrer" aria-label="Open source" sx={{ ml: 0.5 }}><OpenInNew fontSize="inherit" /></Link>}
            </Typography>
          </Stack>)}
          <Box ref={scrollRef} />
        </Box>
        <Box><Button variant="outlined" size="small" onClick={() => void handleCancel()}>Cancel</Button></Box>
      </Stack>}
      {step === "diff" && result && <Stack spacing={2}>
        <Typography variant="body2" color="text.secondary">Review enriched data. Uncheck any fields you don&apos;t want to apply.</Typography>
        <TableContainer sx={{ maxHeight: 380, border: 1, borderColor: "divider", borderRadius: 1 }}><Table size="small" stickyHeader>
          <TableHead><TableRow><TableCell padding="checkbox" /><TableCell>Field</TableCell><TableCell>Current</TableCell><TableCell>Enriched</TableCell></TableRow></TableHead>
          <TableBody>{Object.entries(result.enrichments).map(([fieldName, enrichment]) => {
            const currentValue = (contactCurrentData as Record<string, string | null | undefined>)[fieldName];
            return <TableRow key={fieldName}>
              <TableCell padding="checkbox"><Checkbox size="small" checked={selectedApply.has(fieldName)} onChange={(_, checked) => setSelectedApply((previous) => {
                const next = new Set(previous); checked ? next.add(fieldName) : next.delete(fieldName); return next;
              })} aria-label={`Apply ${fieldName}`} /></TableCell>
              <TableCell sx={{ textTransform: "capitalize", fontWeight: 600, whiteSpace: "nowrap" }}>{fieldName.replace(/_/g, " ")}<Typography variant="caption" color="text.secondary" sx={{ display: "block", fontWeight: 400 }}>{Math.round(enrichment.confidence * 100)}% confident</Typography></TableCell>
              <TableCell sx={{ color: "text.secondary", maxWidth: 120, overflow: "hidden", textOverflow: "ellipsis" }}>{currentValue ?? <Typography variant="caption" sx={{ fontStyle: "italic" }}>empty</Typography>}</TableCell>
              <TableCell sx={{ maxWidth: 180, overflowWrap: "anywhere" }}><Typography variant="body2" sx={{ fontWeight: 600 }}>{String(enrichment.value)}</Typography>
                {enrichment.source && <Link href={enrichment.source} target="_blank" rel="noopener noreferrer" variant="caption" sx={{ display: "inline-flex", alignItems: "center", gap: 0.5, mt: 0.5 }}>Source <OpenInNew fontSize="inherit" /></Link>}
              </TableCell>
            </TableRow>;
          })}</TableBody>
        </Table></TableContainer>
        <Stack direction="row" spacing={1}>
          <Button variant="contained" startIcon={<CheckCircleOutlined />} disabled={!selectedApply.size || applying} onClick={() => void handleApply()} sx={{ flex: 1 }}>{applying ? "Applying…" : `Apply ${selectedApply.size} fields`}</Button>
          <Button variant="outlined" startIcon={<Close />} onClick={() => handleClose(false)}>Discard</Button>
        </Stack>
      </Stack>}
    </Drawer>
    <NoApiKeyDialog open={showNoApiKeyDialog} onClose={() => setShowNoApiKeyDialog(false)} />
  </>;
}
