"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Box,
  Button,
  Card,
  CardContent,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Divider,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import { decideApproval } from "@/actions/crm/opportunities/approval";
import type { PendingApproval } from "@/actions/crm/opportunities/get-pending-approvals";

const ApprovalsTable = ({ rows }: { rows: PendingApproval[] }) => {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [rejecting, setRejecting] = useState<PendingApproval | null>(null);
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);

  const filtered = useMemo(() => {
    const term = query.trim().toLocaleLowerCase();
    if (!term) return rows;
    return rows.filter((row) => [row.name, row.accountName, row.repName, row.id]
      .some((value) => value?.toLocaleLowerCase().includes(term)));
  }, [rows, query]);
  const currentPage = Math.min(page, Math.max(0, Math.ceil(filtered.length / rowsPerPage) - 1));

  const closeReject = () => {
    if (busy) return;
    setRejecting(null);
    setNote("");
  };

  const decide = async (id: string, decision: "APPROVED" | "REJECTED", rejectionNote?: string) => {
    setBusy(true);
    try {
      const result = await decideApproval(id, decision, rejectionNote);
      if (result.error) toast.error(result.error);
      else {
        toast.success(decision === "APPROVED" ? "Quote approved" : "Quote rejected");
        setRejecting(null);
        setNote("");
        router.refresh();
      }
    } catch {
      toast.error("Could not save the approval decision. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Card variant="outlined" sx={{ borderRadius: "var(--radius)", overflow: "hidden", boxShadow: "0 1px 2px 0 rgb(0 0 0 / 0.05)" }}>
      <Box sx={{ p: 3, pb: 1.5 }}>
        <Typography variant="h5" component="h2" sx={{ fontWeight: 600 }}>Pending requests</Typography>
        <Divider sx={{ mt: 2.5 }} />
      </Box>
      <CardContent sx={{ pt: 1.5 }}>
        {rows.length === 0 ? (
          <Typography variant="body2" color="text.secondary" sx={{ py: 4, textAlign: "center" }}>No deals waiting for approval.</Typography>
        ) : (
          <>
            <Stack direction={{ xs: "column", sm: "row" }} spacing={1} sx={{ mb: 2, alignItems: { sm: "center" } }}>
              <TextField
                size="small"
                aria-label="Filter approval requests"
                placeholder="Filter approval requests..."
                value={query}
                onChange={(event) => { setQuery(event.target.value); setPage(0); }}
                sx={{ width: { xs: "100%", sm: 280 }, "& .MuiInputBase-root": { height: 32 } }}
              />
              {query && <Button size="small" onClick={() => { setQuery(""); setPage(0); }}>Reset</Button>}
              <Box sx={{ flex: 1 }} />
              <Typography variant="body2" color="text.secondary">{filtered.length} pending</Typography>
            </Stack>
            <TableContainer sx={{ border: 1, borderColor: "divider", borderRadius: 1 }}>
              <Table data-testid="approvals-table" aria-label="Pending quote approvals" sx={{ minWidth: 800, "& .MuiTableCell-head": { height: 48, fontSize: 14, fontWeight: 500, color: "text.secondary" }, "& .MuiTableCell-body": { fontSize: 14 } }}>
                <TableHead><TableRow>
                  <TableCell>Deal</TableCell><TableCell>Account</TableCell><TableCell>Rep</TableCell><TableCell align="right">Budget</TableCell><TableCell>Requested</TableCell><TableCell align="right">Decision</TableCell>
                </TableRow></TableHead>
                <TableBody>
                  {filtered.slice(currentPage * rowsPerPage, (currentPage + 1) * rowsPerPage).map((row) => (
                    <TableRow key={row.id} hover>
                      <TableCell><Button component={Link} href={`/crm/opportunities/${row.id}`} variant="text" sx={{ p: 0, minWidth: 0, color: "text.primary", fontSize: 14, fontWeight: 600, textTransform: "none", "&:hover": { bgcolor: "transparent", textDecoration: "underline" } }}>{row.name ?? row.id}</Button></TableCell>
                      <TableCell>{row.accountName ?? "—"}</TableCell>
                      <TableCell>{row.repName ?? "—"}</TableCell>
                      <TableCell align="right">{row.budget.toLocaleString()}</TableCell>
                      <TableCell sx={{ whiteSpace: "nowrap" }}>{row.approval_requested_at ? new Date(row.approval_requested_at).toLocaleDateString() : "—"}</TableCell>
                      <TableCell align="right"><Stack direction="row" spacing={1} sx={{ justifyContent: "flex-end" }}>
                        <Button size="small" variant="contained" disabled={busy} onClick={() => void decide(row.id, "APPROVED")}>Approve</Button>
                        <Button size="small" variant="outlined" color="error" disabled={busy} onClick={() => setRejecting(row)}>Reject</Button>
                      </Stack></TableCell>
                    </TableRow>
                  ))}
                  {filtered.length === 0 && <TableRow><TableCell colSpan={6} align="center" sx={{ py: 5 }}>No results.</TableCell></TableRow>}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination
              component="div"
              count={filtered.length}
              page={currentPage}
              onPageChange={(_, nextPage) => setPage(nextPage)}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={(event) => { setRowsPerPage(Number(event.target.value)); setPage(0); }}
              rowsPerPageOptions={[10, 20, 30, 50]}
            />
          </>
        )}
      </CardContent>
      <Dialog open={!!rejecting} onClose={closeReject} fullWidth maxWidth="sm" aria-labelledby="reject-quote-title">
        <DialogTitle id="reject-quote-title">Reject quote — {rejecting?.name ?? ""}</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>The note will be sent to the rep.</DialogContentText>
          <TextField
            autoFocus
            fullWidth
            multiline
            minRows={4}
            label="What needs to change?"
            value={note}
            onChange={(event) => setNote(event.target.value)}
            disabled={busy}
            slotProps={{ htmlInput: { maxLength: 1000 } }}
            helperText={`${note.length}/1000 characters`}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={closeReject} disabled={busy}>Cancel</Button>
          <Button color="error" variant="contained" disabled={busy} onClick={() => { if (rejecting) void decide(rejecting.id, "REJECTED", note); }}>{busy ? "Rejecting..." : "Reject quote"}</Button>
        </DialogActions>
      </Dialog>
    </Card>
  );
};

export default ApprovalsTable;
