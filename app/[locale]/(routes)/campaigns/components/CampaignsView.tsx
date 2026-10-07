"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import moment from "moment";
import { toast } from "sonner";
import { Box, Button, Chip, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, IconButton, Menu, MenuItem, Paper, Select, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TableSortLabel, TextField, Typography } from "@mui/material";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, MoreHorizontal, X } from "lucide-react";
import { deleteCampaign } from "@/actions/campaigns/delete-campaign";

type Campaign = {
  id: string;
  name: string;
  status: string | null;
  scheduled_at: Date | null;
  sent_at: Date | null;
  created_on: Date | null;
  _count?: { sends: number };
  template?: { name: string } | null;
  created_by_user?: { name: string | null } | null;
};
type SortKey = "name" | "status" | "scheduled_at";
const STATUS_OPTIONS = ["All", "draft", "scheduled", "sending", "sent", "paused"];
const columns = ["Name", "Status", "Scheduled At", "Recipients", "Template"] as const;
const statusColor = (status: string | null): "default" | "info" | "warning" | "success" => {
  if (status === "scheduled") return "info";
  if (status === "sending" || status === "paused") return "warning";
  if (status === "sent") return "success";
  return "default";
};

function CampaignRowActions({ campaign }: { campaign: Campaign }) {
  const router = useRouter();
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const onDelete = async () => {
    setLoading(true);
    try {
      const result = await deleteCampaign(campaign.id);
      if ("error" in result) {
        toast.error(result.error);
        return;
      }
      toast.success("Campaign has been deleted");
      router.refresh();
      setConfirmOpen(false);
    } catch {
      toast.error("Could not delete campaign. Please try again.");
    } finally { setLoading(false); }
  };
  return <>
    <IconButton size="small" aria-label={`Actions for ${campaign.name}`} onClick={(event) => setAnchor(event.currentTarget)}><MoreHorizontal size={18} /><span className="sr-only">Open menu</span></IconButton>
    <Menu anchorEl={anchor} open={!!anchor} onClose={() => setAnchor(null)}>
      <MenuItem onClick={() => { setAnchor(null); router.push(`/campaigns/${campaign.id}`); }}>View</MenuItem>
      <MenuItem onClick={() => { setAnchor(null); setConfirmOpen(true); }}>Delete</MenuItem>
    </Menu>
    <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
      <DialogTitle>Delete campaign?</DialogTitle>
      <DialogContent><DialogContentText>This action cannot be undone.</DialogContentText></DialogContent>
      <DialogActions><Button onClick={() => setConfirmOpen(false)} disabled={loading}>Cancel</Button><Button color="error" onClick={onDelete} disabled={loading}>{loading ? "Deleting..." : "Delete"}</Button></DialogActions>
    </Dialog>
  </>;
}

export default function CampaignsView({ data }: { data: Campaign[] }) {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("All");
  const [sortKey, setSortKey] = useState<SortKey | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const filtered = useMemo(() => {
    const result = data.filter((campaign) => campaign.name.toLowerCase().includes(search.trim().toLowerCase()) && (status === "All" || campaign.status === status));
    if (!sortKey) return result;
    return result.sort((a, b) => {
      const left = sortKey === "scheduled_at" ? new Date(a.scheduled_at ?? 0).getTime() : (a[sortKey] ?? "").toLowerCase();
      const right = sortKey === "scheduled_at" ? new Date(b.scheduled_at ?? 0).getTime() : (b[sortKey] ?? "").toLowerCase();
      const comparison = left < right ? -1 : left > right ? 1 : 0;
      return sortDirection === "asc" ? comparison : -comparison;
    });
  }, [data, search, status, sortKey, sortDirection]);
  const pages = Math.max(1, Math.ceil(filtered.length / rowsPerPage));
  const currentPage = Math.min(page, pages - 1);
  const sort = (key: SortKey) => {
    if (sortKey === key) setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    else { setSortKey(key); setSortDirection("asc"); }
  };
  const reset = () => { setSearch(""); setStatus("All"); setPage(0); };
  const sortable: Record<string, SortKey> = { Name: "name", Status: "status", "Scheduled At": "scheduled_at" };
  return <Paper variant="outlined" sx={{ p: 3, borderRadius: "var(--radius)", boxShadow: "0 1px 2px 0 rgb(0 0 0 / 0.05)" }}>
    <Typography variant="h5" component="h2" sx={{ fontWeight: 600, mb: 3 }}>All Campaigns</Typography>
    <Stack direction={{ xs: "column", sm: "row" }} spacing={1} sx={{ mb: 2 }}>
      <TextField size="small" placeholder="Filter by name ..." value={search} onChange={(event) => { setSearch(event.target.value); setPage(0); }} sx={{ width: { xs: "100%", sm: 250 } }} />
      <TextField select size="small" aria-label="Status" value={status} onChange={(event) => { setStatus(event.target.value); setPage(0); }} sx={{ minWidth: 150 }}>
        {STATUS_OPTIONS.map((item) => <MenuItem key={item} value={item}>{item === "All" ? "All Statuses" : item.charAt(0).toUpperCase() + item.slice(1)}</MenuItem>)}
      </TextField>
      {(search || status !== "All") && <Button color="inherit" size="small" endIcon={<X size={16} />} onClick={reset}>Reset</Button>}
    </Stack>
    <TableContainer sx={{ border: 1, borderColor: "divider", borderRadius: "var(--radius)" }}>
      <Table size="small" data-testid="campaigns-table">
        <TableHead><TableRow>{columns.map((label) => <TableCell key={label} sx={{ color: "text.secondary", whiteSpace: "nowrap" }}>
          {sortable[label] ? <TableSortLabel active={sortKey === sortable[label]} direction={sortKey === sortable[label] ? sortDirection : "asc"} onClick={() => sort(sortable[label])}>{label}</TableSortLabel> : label}
        </TableCell>)}<TableCell aria-label="Actions" /></TableRow></TableHead>
        <TableBody>{filtered.length ? filtered.slice(currentPage * rowsPerPage, (currentPage + 1) * rowsPerPage).map((campaign) =>
          <TableRow key={campaign.id} hover>
            <TableCell><Link className="font-medium" href={`/campaigns/${campaign.id}`} style={{ color: "inherit", fontWeight: 500 }}>{campaign.name}</Link></TableCell>
            <TableCell>{campaign.status ? <Chip size="small" color={statusColor(campaign.status)} label={campaign.status} /> : "—"}</TableCell>
            <TableCell sx={{ whiteSpace: "nowrap" }}>{campaign.scheduled_at ? moment(campaign.scheduled_at).format("YY-MM-DD HH:mm") : "—"}</TableCell>
            <TableCell align="right">{campaign._count?.sends ?? 0}</TableCell>
            <TableCell>{campaign.template?.name ?? "—"}</TableCell>
            <TableCell><CampaignRowActions campaign={campaign} /></TableCell>
          </TableRow>
        ) : <TableRow><TableCell colSpan={6} align="center" sx={{ py: 5 }}>No campaigns found.</TableCell></TableRow>}</TableBody>
      </Table>
    </TableContainer>
    <Stack direction={{ xs: "column", md: "row" }} spacing={2} sx={{ mt: 2, alignItems: "center", justifyContent: "space-between" }}>
      <Typography variant="body2" color="text.secondary">{filtered.length} campaign(s)</Typography>
      <Stack direction="row" spacing={2} sx={{ alignItems: "center" }}>
        <Typography variant="body2">Rows per page</Typography>
        <Select size="small" value={rowsPerPage} onChange={(event) => { setRowsPerPage(Number(event.target.value)); setPage(0); }}>
          {[10, 20, 30, 40, 50].map((count) => <MenuItem key={count} value={count}>{count}</MenuItem>)}
        </Select>
        <Typography variant="body2" sx={{ whiteSpace: "nowrap" }}>Page {currentPage + 1} of {pages}</Typography>
        <Box sx={{ display: "flex" }}>
          <IconButton size="small" aria-label="First page" onClick={() => setPage(0)} disabled={currentPage === 0}><ChevronsLeft size={18} /></IconButton>
          <IconButton size="small" aria-label="Previous page" onClick={() => setPage(currentPage - 1)} disabled={currentPage === 0}><ChevronLeft size={18} /></IconButton>
          <IconButton size="small" aria-label="Next page" onClick={() => setPage(currentPage + 1)} disabled={currentPage >= pages - 1}><ChevronRight size={18} /></IconButton>
          <IconButton size="small" aria-label="Last page" onClick={() => setPage(pages - 1)} disabled={currentPage >= pages - 1}><ChevronsRight size={18} /></IconButton>
        </Box>
      </Stack>
    </Stack>
  </Paper>;
}
