"use client";

import { useState, useRef } from "react";
import { Alert, Box, Button, Checkbox, Chip, Drawer, Link, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from "@mui/material";
import { Sparkles, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { EnrichFieldSelector } from "../../components/EnrichFieldSelector";
import type { EnrichmentField } from "@/lib/enrichment/types";
import type { StoredEnrichmentResult } from "@/lib/enrichment/types/stored-result";
import {
  PERSONAL_PRESET_FIELDS,
  PERSONAL_DEFAULTS,
  COMPANY_PRESET_FIELDS,
  COMPANY_DEFAULTS,
} from "@/lib/enrichment/presets/target-fields";
import { NoApiKeyDialog } from "@/app/components/NoApiKeyDialog";

type Step = "select" | "progress" | "diff";
type EnrichScenario = "personal" | "company" | "none";

interface AgentMessage {
  message: string;
  type: string;
  sourceUrl?: string;
}

interface TargetCurrentData {
  position?: string | null;
  company?: string | null;
  company_website?: string | null;
  personal_website?: string | null;
  mobile_phone?: string | null;
  office_phone?: string | null;
  social_linkedin?: string | null;
  social_x?: string | null;
  social_instagram?: string | null;
  social_facebook?: string | null;
}

interface EnrichTargetDrawerProps {
  targetId: string;
  targetEmail: string | null;
  targetCompany: string | null;
  targetCurrentData: TargetCurrentData;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onApplied: () => void;
}


function getScenario(email: string | null, company: string | null): EnrichScenario {
  if (email) return "personal";
  if (company) return "company";
  return "none";
}

export function EnrichTargetDrawer({
  targetId,
  targetEmail,
  targetCompany,
  targetCurrentData,
  open,
  onOpenChange,
  onApplied,
}: EnrichTargetDrawerProps) {
  const scenario = getScenario(targetEmail, targetCompany);
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
    setStep("select");
    setMessages([]);
    setResult(null);
    setEnrichmentId(null);
    setSessionId(null);
    setSelectedApply(new Set());
  };

  const handleClose = (open: boolean) => {
    if (!open) reset();
    onOpenChange(open);
  };

  const handleStart = async (fields: EnrichmentField[]) => {
    setStep("progress");
    setMessages([]);

    const response = await fetch("/api/campaigns/targets/enrich", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ targetId, fields }),
    });

    if (!response.ok) {
      const err = await response.json();
      if (response.status === 402 || err.error === "NO_API_KEY") {
        setShowNoApiKeyDialog(true);
        setStep("select");
        return;
      }
      toast.error(err.error ?? "Failed to start enrichment");
      setStep("select");
      return;
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
          setMessages((prev) => [...prev, { message: event.message, type: event.messageType, sourceUrl: event.sourceUrl }]);
          setTimeout(() => scrollRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
        } else if (event.type === "result") {
          setResult(event.result);
          setEnrichmentId(event.enrichmentId);
          setSelectedApply(new Set(Object.keys(event.result.enrichments)));
        } else if (event.type === "complete") {
          setStep("diff");
        } else if (event.type === "error") {
          toast.error(event.error);
          setStep("select");
        }
      }
    }
  };

  const handleCancel = async () => {
    if (sessionId) {
      await fetch(`/api/campaigns/targets/enrich?sessionId=${sessionId}`, { method: "DELETE" });
    }
    reset();
  };

  const handleApply = async () => {
    if (!result || !enrichmentId) return;
    setApplying(true);

    const updates: Record<string, string> = {};
    for (const [fieldName, enrichment] of Object.entries(result.enrichments)) {
      if (selectedApply.has(fieldName) && enrichment.value) {
        updates[fieldName] = String(enrichment.value);
      }
    }

    const res = await fetch(`/api/campaigns/targets/${targetId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ enrichmentFields: updates }),
    });

    if (res.ok) {
      toast.success("Target enriched successfully");
      onApplied();
      handleClose(false);
    } else {
      const err = await res.json();
      toast.error(err.error ?? "Failed to apply enrichment");
    }
    setApplying(false);
  };

  const presetFields = scenario === "company" ? COMPANY_PRESET_FIELDS : PERSONAL_PRESET_FIELDS;
  const defaultSelected = scenario === "company" ? COMPANY_DEFAULTS : PERSONAL_DEFAULTS;

  return <>
    <NoApiKeyDialog open={showNoApiKeyDialog} onClose={() => setShowNoApiKeyDialog(false)} />
    <Drawer anchor="right" open={open} onClose={() => handleClose(false)} slotProps={{ paper: { sx: { width: { xs: "100%", sm: 540 }, p: 3, overflowY: "auto" } } }}>
      <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}><Sparkles size={18} color="#f97316" /><Typography variant="h6" sx={{ fontWeight: 600 }}>Enrich with AI</Typography></Stack>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>Firecrawl searches the web to fill in missing target details.</Typography>
      {scenario === "none" && <Alert severity="warning">Add an email or company name to this target to enable enrichment.</Alert>}
      {scenario !== "none" && step === "select" && <Stack spacing={2}>
        <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
          <Chip size="small" label={scenario === "personal" ? "Personal search" : "Company search"} />
          <Typography variant="caption" color="text.secondary">{scenario === "personal" ? "Using email to find contact & company info" : "Using company name to find company details"}</Typography>
        </Stack>
        <EnrichFieldSelector onStart={handleStart} presetFields={presetFields} defaultSelected={defaultSelected} />
      </Stack>}
      {step === "progress" && <Stack spacing={2}>
        <Box sx={{ height: 400, overflowY: "auto" }}>{messages.map((message, index) => <Stack key={index} direction="row" spacing={1} sx={{ py: 0.5 }}>
          <Typography variant="body2" color="text.secondary">{message.type === "success" ? "✓" : message.type === "agent" ? "🤖" : "›"}</Typography>
          <Typography variant="body2">{message.message} {message.sourceUrl && <Link href={message.sourceUrl} target="_blank" rel="noopener noreferrer"><ExternalLink size={13} /></Link>}</Typography>
        </Stack>)}<div ref={scrollRef} /></Box>
        <Box><Button variant="outlined" size="small" onClick={handleCancel}>Cancel</Button></Box>
      </Stack>}
      {step === "diff" && result && <Stack spacing={2}>
        <Typography variant="body2" color="text.secondary">Review enriched data. Uncheck any fields you don&apos;t want to apply.</Typography>
        <TableContainer sx={{ maxHeight: 380, border: 1, borderColor: "divider" }}><Table size="small" stickyHeader>
          <TableHead><TableRow><TableCell padding="checkbox" /><TableCell>Field</TableCell><TableCell>Current</TableCell><TableCell>Enriched</TableCell></TableRow></TableHead>
          <TableBody>{Object.entries(result.enrichments).map(([fieldName, enrichment]) => {
            const currentValue = (targetCurrentData as Record<string, string | null | undefined>)[fieldName];
            return <TableRow key={fieldName}>
              <TableCell padding="checkbox"><Checkbox checked={selectedApply.has(fieldName)} onChange={(_, checked) => setSelectedApply((previous) => { const next = new Set(previous); if (checked) next.add(fieldName); else next.delete(fieldName); return next; })} /></TableCell>
              <TableCell sx={{ textTransform: "capitalize", whiteSpace: "nowrap" }}>{fieldName.replace(/_/g, " ")}<Typography variant="caption" color="text.secondary" sx={{ display: "block" }}>{Math.round(enrichment.confidence * 100)}% confident</Typography></TableCell>
              <TableCell>{currentValue ?? <Typography variant="caption" color="text.secondary">empty</Typography>}</TableCell>
              <TableCell>{String(enrichment.value)}{enrichment.source && <Link href={enrichment.source} target="_blank" rel="noopener noreferrer" sx={{ display: "block", fontSize: 12 }}>Source</Link>}</TableCell>
            </TableRow>;
          })}</TableBody>
        </Table></TableContainer>
        <Stack direction="row" spacing={1}><Button variant="contained" disabled={!selectedApply.size || applying} onClick={handleApply}>{applying ? "Applying…" : `Apply ${selectedApply.size} fields`}</Button><Button variant="outlined" onClick={() => handleClose(false)}>Discard</Button></Stack>
      </Stack>}
    </Drawer>
  </>;
}
