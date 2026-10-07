"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Box, Button, Chip, Divider, Drawer, Stack, Typography } from "@mui/material";
import { toast } from "sonner";
import moment from "moment";
import { getDocumentVersions } from "@/actions/documents/get-document-versions";
import { retryEnrichment } from "@/actions/documents/retry-enrichment";
import { DocumentRow } from "../data/schema";
import { ProcessingStatusBadge } from "./processing-status-badge";

type Version = { id: string; version: number; createdAt: Date | null; size: number | null; created_by: { name: string | null } | null };

export function DocumentDetailPanel({ document, open, onClose }: { document: DocumentRow | null; open: boolean; onClose: () => void }) {
  const [versions, setVersions] = useState<Version[]>([]);
  const router = useRouter();
  useEffect(() => {
    if (document?.id && open) getDocumentVersions(document.id).then(setVersions).catch(() => {});
  }, [document?.id, open]);
  if (!document) return null;
  async function handleRetry() {
    try { await retryEnrichment(document!.id); toast.success("Enrichment re-triggered"); router.refresh(); }
    catch { toast.error("Failed to retry enrichment"); }
  }
  const metadata = [
    ["Type", document.document_system_type ?? "OTHER"],
    ["Version", String(document.version)],
    ["Created", document.createdAt ? moment(document.createdAt).format("MMM D, YYYY") : "—"],
    ["Account", document.accounts?.[0]?.account?.name ?? "—"],
  ];
  return <Drawer anchor="right" open={open} onClose={onClose}><Box sx={{ width: { xs: "100vw", sm: 540 }, maxWidth: "100vw", height: "100%", overflowY: "auto", p: 3 }}><Typography variant="h6">{document.document_name}</Typography><Stack spacing={3} sx={{ mt: 3 }}><Stack direction="row" spacing={1} sx={{ alignItems: "center" }}><ProcessingStatusBadge status={document.processing_status} />{document.processing_status === "FAILED" && <Button size="small" variant="outlined" onClick={handleRetry}>Retry</Button>}</Stack>{document.summary && <Box><Typography variant="subtitle2">Summary</Typography><Typography variant="body2" color="text.secondary">{document.summary}</Typography></Box>}<Divider /><Box sx={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 2 }}>{metadata.map(([label, value]) => <Box key={label}><Typography variant="caption" color="text.secondary">{label}</Typography><Typography variant="body2">{value}</Typography></Box>)}</Box><Divider /><Box><Typography variant="subtitle2" sx={{ mb: 1 }}>Version History</Typography><Stack spacing={1}>{versions.map((version) => <Stack key={version.id} direction="row" spacing={1} sx={{ alignItems: "center", justifyContent: "space-between" }}><Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>{version.version === document.version && <Chip size="small" color="primary" label="Current" />}<Typography variant="body2">Version {version.version}</Typography></Stack><Typography variant="caption" color="text.secondary">{version.createdAt ? moment(version.createdAt).format("MMM D, YYYY") : ""} {version.created_by?.name ? `by ${version.created_by.name}` : ""}</Typography></Stack>)}</Stack></Box></Stack></Box></Drawer>;
}
