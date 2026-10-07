"use client";

import { useState } from "react";
import { Box, Chip, MenuItem, Paper, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Typography } from "@mui/material";

type Send = {
  id: string; email: string; status: string; opened_at: Date | null; clicked_at: Date | null;
  unsubscribed_at: Date | null; sent_at: Date | null;
  target: { first_name: string | null; last_name: string | null } | null;
};
const statuses = ["all", "queued", "sent", "delivered", "bounced", "failed"];
const statusColor = (status: string): "default" | "info" | "success" | "error" => {
  if (status === "sent") return "info";
  if (status === "delivered") return "success";
  if (status === "bounced" || status === "failed") return "error";
  return "default";
};

export default function RecipientsTable({ sends }: { sends: Send[] }) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const filtered = sends.filter((send) => {
    const name = `${send.target?.first_name ?? ""} ${send.target?.last_name ?? ""}`.toLowerCase();
    return (!search || name.includes(search.toLowerCase()) || send.email.toLowerCase().includes(search.toLowerCase())) &&
      (statusFilter === "all" || send.status === statusFilter);
  });
  return <Paper variant="outlined" sx={{ p: 3, borderRadius: "var(--radius)" }}>
    <Typography variant="h6" component="h2" sx={{ fontWeight: 600, mb: 2 }}>Recipients</Typography>
    <Stack direction={{ xs: "column", sm: "row" }} spacing={1} sx={{ mb: 2 }}>
      <TextField size="small" placeholder="Search name or email..." value={search} onChange={(event) => setSearch(event.target.value)} sx={{ width: { xs: "100%", sm: 300 } }} />
      <TextField select size="small" label="Status" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} sx={{ minWidth: 160 }}>
        {statuses.map((status) => <MenuItem key={status} value={status}>{status === "all" ? "All statuses" : status.charAt(0).toUpperCase() + status.slice(1)}</MenuItem>)}
      </TextField>
    </Stack>
    <TableContainer sx={{ border: 1, borderColor: "divider", borderRadius: "var(--radius)" }}><Table size="small">
      <TableHead><TableRow>{["Name", "Email", "Status", "Opened", "Clicked", "Bounced"].map((label) => <TableCell key={label} sx={{ color: "text.secondary" }}>{label}</TableCell>)}</TableRow></TableHead>
      <TableBody>{filtered.map((send) => <TableRow key={send.id} hover>
        <TableCell>{send.target ? `${send.target.first_name ?? ""} ${send.target.last_name ?? ""}`.trim() || "—" : "—"}</TableCell>
        <TableCell sx={{ color: "text.secondary" }}>{send.email}</TableCell>
        <TableCell><Chip size="small" label={send.status.charAt(0).toUpperCase() + send.status.slice(1)} color={statusColor(send.status)} /></TableCell>
        <TableCell>{send.opened_at ? "✓" : "–"}</TableCell><TableCell>{send.clicked_at ? "✓" : "–"}</TableCell><TableCell>{send.status === "bounced" ? "✓" : "–"}</TableCell>
      </TableRow>)}
      {!filtered.length && <TableRow><TableCell colSpan={6} align="center" sx={{ py: 5 }}>No recipients found.</TableCell></TableRow>}
      </TableBody>
    </Table></TableContainer>
    <Box sx={{ mt: 1.5 }}><Typography variant="caption" color="text.secondary">{filtered.length} of {sends.length} recipients</Typography></Box>
  </Paper>;
}
