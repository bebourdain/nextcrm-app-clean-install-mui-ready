import { Box, Chip, Divider, Paper, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Tooltip, Typography } from "@mui/material";
import { MuiPageHeader } from "@/components/mui/MuiPageHeader";
import { prismadb } from "@/lib/prisma";
import { getSession } from "@/lib/auth-server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { RefreshCw } from "lucide-react";
import moment from "moment";
import { RetryEnrichmentButton } from "./RetryEnrichmentButton";

export const dynamic = "force-dynamic";

const STATUS_LABELS = {
  PENDING: { label: "Pending", color: "default" },
  RUNNING: { label: "Running", color: "primary" },
  COMPLETED: { label: "Completed", color: "success" },
  FAILED: { label: "Failed", color: "error" },
  SKIPPED: { label: "Skipped", color: "default" },
} as const;

export default async function EnrichmentJobsPage() {
  const session = await getSession();
  if (!session) redirect("/sign-in");
  const records = await prismadb.crm_Contact_Enrichment.findMany({
    orderBy: { createdAt: "desc" },
    take: 200,
    include: {
      contact: { select: { id: true, first_name: true, last_name: true, email: true } },
      triggered_by_user: { select: { name: true } },
    },
  });
  return <Box sx={{ width: "100%", pb: 6 }}>
    <Stack direction="row" sx={{ alignItems: "center", justifyContent: "space-between" }}>
      <MuiPageHeader title="Enrichment Jobs" description="Recent contact enrichment activity" />
      <Link href="." style={{ color: "inherit", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 6, fontSize: 14 }}><RefreshCw size={16} />Refresh</Link>
    </Stack>
    <Divider sx={{ my: 2 }} />
    <Paper variant="outlined" sx={{ borderRadius: "var(--radius)", overflow: "hidden" }}>
      <Box sx={{ p: 2.5, borderBottom: 1, borderColor: "divider" }}><Typography variant="h6">{records.length} enrichment job{records.length !== 1 ? "s" : ""}</Typography></Box>
      <TableContainer><Table size="small">
        <TableHead><TableRow><TableCell>Contact</TableCell><TableCell>Status</TableCell><TableCell>Fields</TableCell><TableCell>Started</TableCell><TableCell>By</TableCell><TableCell aria-label="Actions" /></TableRow></TableHead>
        <TableBody>
          {records.length === 0 && <TableRow><TableCell colSpan={6} align="center" sx={{ py: 5, color: "text.secondary" }}>No enrichment jobs yet. Start one from the contacts list.</TableCell></TableRow>}
          {records.map((record) => {
            const statusInfo = STATUS_LABELS[record.status as keyof typeof STATUS_LABELS] ?? STATUS_LABELS.PENDING;
            return <TableRow key={record.id} hover sx={record.status === "RUNNING" ? { bgcolor: "action.hover" } : undefined}>
              <TableCell><Link href={`/crm/contacts/${record.contact.id}`} style={{ color: "inherit", textDecoration: "none", fontWeight: 600 }}>{record.contact.first_name} {record.contact.last_name}</Link>
                {record.contact.email && <Typography variant="caption" color="text.secondary" sx={{ display: "block" }}>{record.contact.email}</Typography>}</TableCell>
              <TableCell><Chip size="small" label={statusInfo.label} color={statusInfo.color} variant={record.status === "SKIPPED" ? "outlined" : "filled"} />
                {record.error && <Tooltip title={record.error}><Typography variant="caption" color="text.secondary" sx={{ display: "block", maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", mt: 0.5 }}>{record.error}</Typography></Tooltip>}</TableCell>
              <TableCell sx={{ color: "text.secondary" }}>{record.fields.join(", ")}</TableCell>
              <TableCell sx={{ color: "text.secondary", whiteSpace: "nowrap" }}>{moment(record.createdAt).fromNow()}</TableCell>
              <TableCell sx={{ color: "text.secondary" }}>{record.triggered_by_user?.name ?? "—"}</TableCell>
              <TableCell>{record.status === "FAILED" && <RetryEnrichmentButton contactId={record.contact.id} fields={record.fields} />}</TableCell>
            </TableRow>;
          })}
        </TableBody>
      </Table></TableContainer>
    </Paper>
  </Box>;
}
