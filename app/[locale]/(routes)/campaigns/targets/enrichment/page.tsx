import { prismadb } from "@/lib/prisma";
import { getSession } from "@/lib/auth-server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Box, Chip, Divider, Paper, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from "@mui/material";
import { MuiPageHeader } from "@/components/mui/MuiPageHeader";
import { MuiLinkButton } from "@/components/mui/MuiLinkButton";
import { RefreshCw } from "lucide-react";
import moment from "moment";
import { RetryEnrichmentButton } from "./RetryEnrichmentButton";

export const dynamic = "force-dynamic";
const STATUS_LABELS: Record<string, string> = { PENDING: "Pending", RUNNING: "Running", COMPLETED: "Completed", FAILED: "Failed", SKIPPED: "Skipped" };
const statusColor = (status: string): "default" | "info" | "success" | "error" => {
  if (status === "RUNNING") return "info";
  if (status === "COMPLETED") return "success";
  if (status === "FAILED") return "error";
  return "default";
};

export default async function TargetEnrichmentJobsPage() {
  const session = await getSession();
  if (!session) redirect("/sign-in");
  const records = await prismadb.crm_Target_Enrichment.findMany({
    orderBy: { createdAt: "desc" }, take: 200,
    include: { target: { select: { id: true, first_name: true, last_name: true, email: true } }, triggered_by_user: { select: { name: true } } },
  });
  return <Box sx={{ width: "100%", pb: 6 }}>
    <MuiPageHeader title="Target Enrichment Jobs" action={<MuiLinkButton href="." variant="outlined" startIcon={<RefreshCw size={16} />}>Refresh</MuiLinkButton>} />
    <Divider sx={{ my: 2 }} />
    <Paper variant="outlined" sx={{ p: 3, borderRadius: "var(--radius)" }}>
      <Typography variant="h6" component="h2" sx={{ fontWeight: 600, mb: 2 }}>{records.length} enrichment job{records.length !== 1 ? "s" : ""}</Typography>
      <TableContainer sx={{ border: 1, borderColor: "divider", borderRadius: "var(--radius)" }}><Table size="small">
        <TableHead><TableRow>{["Target", "Status", "Fields", "Started", "By", ""].map((label, index) => <TableCell key={`${label}-${index}`} sx={{ color: "text.secondary" }}>{label}</TableCell>)}</TableRow></TableHead>
        <TableBody>{!records.length && <TableRow><TableCell colSpan={6} align="center" sx={{ py: 5 }}>No enrichment jobs yet. Start one from the targets list.</TableCell></TableRow>}
          {records.map((record) => <TableRow key={record.id} hover selected={record.status === "RUNNING"}>
            <TableCell><Link href={`/crm/targets/${record.target.id}`} style={{ fontWeight: 600 }}>{record.target.first_name} {record.target.last_name}</Link>{record.target.email && <Typography variant="caption" color="text.secondary" sx={{ display: "block" }}>{record.target.email}</Typography>}</TableCell>
            <TableCell><Chip size="small" color={statusColor(record.status)} label={STATUS_LABELS[record.status] ?? record.status} />{record.error && <Typography variant="caption" color="text.secondary" sx={{ display: "block", maxWidth: 200 }} title={record.error}>{record.error}</Typography>}</TableCell>
            <TableCell sx={{ color: "text.secondary" }}>{record.fields.join(", ")}</TableCell>
            <TableCell sx={{ color: "text.secondary", whiteSpace: "nowrap" }}>{moment(record.createdAt).fromNow()}</TableCell>
            <TableCell sx={{ color: "text.secondary" }}>{record.triggered_by_user?.name ?? "—"}</TableCell>
            <TableCell>{record.status === "FAILED" && <RetryEnrichmentButton targetId={record.target.id} fields={record.fields} />}</TableCell>
          </TableRow>)}
        </TableBody>
      </Table></TableContainer>
    </Paper>
  </Box>;
}
