"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import moment from "moment";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, MoreHorizontal, PanelTopClose, PanelTopOpen, X } from "lucide-react";
import { Box, Button, Checkbox, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Divider, Drawer, IconButton, Menu, MenuItem, Paper, Select, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Typography } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import type { getAllCrmData } from "@/actions/crm/get-crm-data";
import type { crm_Leads } from "@prisma/client";
import { deleteLead } from "@/actions/crm/leads/delete-lead";
import { NewLeadForm } from "../leads/components/NewLeadForm";
import { UpdateLeadForm } from "../leads/components/UpdateLeadForm";

type CrmData = Awaited<ReturnType<typeof getAllCrmData>>;
type Lead = crm_Leads & { assigned_to_user?: { name: string | null } | null };
type OptionalColumn = "owner" | "company" | "name" | "email" | "status";
type SortKey = "owner" | "email";
const labels: Record<OptionalColumn, string> = { owner: "Assigned to", company: "Company", name: "Name", email: "E-mail", status: "Status" };

export default function LeadsView({ data, crmData, accountId }: { data: Lead[]; crmData: CrmData; accountId?: string }) {
  const router = useRouter();
  const theme = useTheme();
  const t = useTranslations("CrmPage");
  const [search, setSearch] = useState("");
  const [statuses, setStatuses] = useState<string[]>([]);
  const [visible, setVisible] = useState<Record<OptionalColumn, boolean>>({ owner: true, company: true, name: true, email: true, status: true });
  const [sort, setSort] = useState<{ key: SortKey; direction: "asc" | "desc" } | null>(null);
  const [sortKey, setSortKey] = useState<SortKey | null>(null);
  const [sortAnchor, setSortAnchor] = useState<HTMLElement | null>(null);
  const [statusAnchor, setStatusAnchor] = useState<HTMLElement | null>(null);
  const [viewAnchor, setViewAnchor] = useState<HTMLElement | null>(null);
  const [rowAnchor, setRowAnchor] = useState<HTMLElement | null>(null);
  const [actionRow, setActionRow] = useState<Lead | null>(null);
  const [updateRow, setUpdateRow] = useState<Lead | null>(null);
  const [deleteRow, setDeleteRow] = useState<Lead | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [hide, setHide] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const records = useMemo(() => {
    const filtered = data.filter((record) =>
      (record.company ?? "").toLowerCase().includes(search.trim().toLowerCase()) &&
      (statuses.length === 0 || statuses.includes(record.lead_status_id ?? "")));
    if (sort) filtered.sort((a, b) => {
      const value = sort.key === "owner" ? (a.assigned_to_user?.name ?? "").localeCompare(b.assigned_to_user?.name ?? "") : (a.email ?? "").localeCompare(b.email ?? "");
      return sort.direction === "asc" ? value : -value;
    });
    return filtered;
  }, [data, search, statuses, sort]);
  const pageCount = Math.max(1, Math.ceil(records.length / rowsPerPage));
  const currentPage = Math.min(page, pageCount - 1);
  const closeCreate = () => { setCreateOpen(false); router.refresh(); };
  const closeUpdate = () => { setUpdateRow(null); router.refresh(); };
  const confirmDelete = async () => {
    if (!deleteRow) return;
    setDeleting(true);
    try {
      const result = await deleteLead(deleteRow.id);
      if (result.error) toast.error(result.error);
      else { toast.success("Lead has been deleted"); router.refresh(); }
    } catch { toast.error("Something went wrong while deleting lead. Please try again."); }
    finally { setDeleting(false); setDeleteRow(null); }
  };
  const sortHeader = (key: SortKey, label: string) => <Button variant="text" onClick={(event) => { setSortKey(key); setSortAnchor(event.currentTarget); }} sx={{ minWidth: 0, ml: -1.5, color: "text.secondary", textTransform: "none" }}>{label}{sort?.key === key ? (sort.direction === "asc" ? " ↑" : " ↓") : " ↕"}</Button>;
  const closeRowMenu = () => { setRowAnchor(null); setActionRow(null); };
  const name = (record: Lead) => [record.firstName, record.lastName].filter(Boolean).join(" ");

  return <Paper variant="outlined" sx={{ borderRadius: "var(--radius)", overflow: "hidden", boxShadow: "0 1px 2px 0 rgb(0 0 0 / 0.05)" }}>
    <Box sx={{ p: 3, pb: 1.5 }}>
      <Stack direction="row" sx={{ alignItems: "center", justifyContent: "space-between" }}>
        <Typography variant="h5" component="h2" sx={{ fontWeight: 600 }}><Link href="/crm/leads" style={{ color: "inherit", textDecoration: "none" }}>{t("leads.viewTitle")}</Link></Typography>
        <Button variant="contained" aria-label={t("leads.addNew")} data-testid="add-lead-btn" onClick={() => setCreateOpen(true)} sx={{ minWidth: 36, my: 1 }}>+</Button>
      </Stack>
      <Divider sx={{ mt: 2.5 }} />
    </Box>
    <Box sx={{ px: 3, pb: 3 }}>
      <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 1 }}><IconButton size="small" aria-label={hide ? "Show table content" : "Hide table content"} onClick={() => setHide(!hide)}>{hide ? <PanelTopOpen size={18} /> : <PanelTopClose size={18} />}</IconButton></Box>
      {hide ? <Typography variant="body2">This content is hidden now. Use the icon above to show content.</Typography> :
        !data?.length ? <Typography variant="body2">{t("leads.empty")}</Typography> : <>
          <Stack direction={{ xs: "column", md: "row" }} spacing={1} sx={{ alignItems: { md: "center" } }}>
            <TextField size="small" placeholder="Filter leads ..." aria-label="Filter leads by company" value={search} onChange={(event) => { setSearch(event.target.value); setPage(0); }} sx={{ width: { xs: "100%", md: 250 }, "& .MuiInputBase-root": { height: 32 } }} />
            {visible.status && <Button variant="outlined" onClick={(event) => setStatusAnchor(event.currentTarget)} sx={{ height: 32, textTransform: "none" }}>Status{statuses.length ? ` · ${statuses.length} selected` : ""}</Button>}
            {(search || statuses.length > 0) && <Button onClick={() => { setSearch(""); setStatuses([]); setPage(0); }}>Reset</Button>}
            <Box sx={{ flex: 1 }} />
            <Button variant="outlined" onClick={(event) => setViewAnchor(event.currentTarget)} sx={{ height: 32, textTransform: "none" }}>View</Button>
          </Stack>
          <TableContainer sx={{ mt: 2, border: 1, borderColor: "divider", borderRadius: "calc(var(--radius) - 2px)" }}>
            <Table data-testid="leads-table" sx={{ minWidth: 1000, "& .MuiTableCell-head": { color: "text.secondary", fontSize: 14, fontWeight: 500 }, "& .MuiTableCell-body": { fontSize: 14 }, "& .MuiTableRow-hover:hover": { bgcolor: theme.alpha(theme.palette.secondary.main, 0.5) } }}>
              <TableHead><TableRow>
                <TableCell>Created</TableCell><TableCell>Last update</TableCell>
                {visible.owner && <TableCell>{sortHeader("owner", labels.owner)}</TableCell>}
                {visible.company && <TableCell>Company</TableCell>}
                {visible.name && <TableCell>Name</TableCell>}
                {visible.email && <TableCell>{sortHeader("email", labels.email)}</TableCell>}
                <TableCell>Phone</TableCell>
                {visible.status && <TableCell>Status</TableCell>}
                <TableCell aria-label="Actions" />
              </TableRow></TableHead>
              <TableBody>
                {records.slice(currentPage * rowsPerPage, (currentPage + 1) * rowsPerPage).map((record) => <TableRow key={record.id} hover>
                  <TableCell sx={{ whiteSpace: "nowrap" }}>{record.createdAt ? moment(record.createdAt).format("YY-MM-DD") : "—"}</TableCell>
                  <TableCell sx={{ whiteSpace: "nowrap" }}>{record.updatedAt ? moment(record.updatedAt).format("YY-MM-DD") : "—"}</TableCell>
                  {visible.owner && <TableCell>{record.assigned_to_user?.name ?? "Unassigned"}</TableCell>}
                  {visible.company && <TableCell>{record.company ?? "Unassigned"}</TableCell>}
                  {visible.name && <TableCell><Button component={Link} href={`/crm/leads/${record.id}`} data-testid="lead-row-name" variant="text" sx={{ p: 0, minWidth: 0, textTransform: "none", color: "text.primary" }}>{name(record)}</Button></TableCell>}
                  {visible.email && <TableCell>{record.email ?? "—"}</TableCell>}
                  <TableCell>{record.phone ?? "—"}</TableCell>
                  {visible.status && <TableCell>{crmData.leadStatuses.find((status) => status.id === record.lead_status_id)?.name ?? "—"}</TableCell>}
                  <TableCell><IconButton size="small" aria-label={`Actions for ${name(record)}`} onClick={(event) => { setActionRow(record); setRowAnchor(event.currentTarget); }}><MoreHorizontal size={16} /></IconButton></TableCell>
                </TableRow>)}
                {records.length === 0 && <TableRow><TableCell colSpan={4 + Object.values(visible).filter(Boolean).length} align="center" sx={{ py: 5 }}>No results.</TableCell></TableRow>}
              </TableBody>
            </Table>
          </TableContainer>
          <Box sx={{ display: "flex", justifyContent: "flex-end", alignItems: "center", mt: 2, gap: 2, flexWrap: "wrap" }}>
            <Typography variant="body2">Rows per page</Typography>
            <Select size="small" value={rowsPerPage} onChange={(event) => { setRowsPerPage(Number(event.target.value)); setPage(0); }} sx={{ height: 32, width: 70 }}>{[10, 20, 30, 40, 50].map((count) => <MenuItem key={count} value={count}>{count}</MenuItem>)}</Select>
            <Typography variant="body2">Page {currentPage + 1} of {pageCount}</Typography>
            <Stack direction="row">
              <IconButton aria-label="Go to first page" disabled={currentPage === 0} onClick={() => setPage(0)}><ChevronsLeft size={16} /></IconButton>
              <IconButton aria-label="Go to previous page" disabled={currentPage === 0} onClick={() => setPage(currentPage - 1)}><ChevronLeft size={16} /></IconButton>
              <IconButton aria-label="Go to next page" disabled={currentPage >= pageCount - 1} onClick={() => setPage(currentPage + 1)}><ChevronRight size={16} /></IconButton>
              <IconButton aria-label="Go to last page" disabled={currentPage >= pageCount - 1} onClick={() => setPage(pageCount - 1)}><ChevronsRight size={16} /></IconButton>
            </Stack>
          </Box>
        </>}
    </Box>
    <Menu anchorEl={statusAnchor} open={!!statusAnchor} onClose={() => setStatusAnchor(null)}>{crmData.leadStatuses.map((status) => <MenuItem key={status.id} onClick={() => { setStatuses((current) => current.includes(status.id) ? current.filter((id) => id !== status.id) : [...current, status.id]); setPage(0); }}><Checkbox size="small" checked={statuses.includes(status.id)} />{status.name}</MenuItem>)}</Menu>
    <Menu anchorEl={viewAnchor} open={!!viewAnchor} onClose={() => setViewAnchor(null)}><MenuItem disabled>Toggle columns</MenuItem><Divider />{(Object.keys(labels) as OptionalColumn[]).map((key) => <MenuItem key={key} onClick={() => { setVisible((old) => ({ ...old, [key]: !old[key] })); if (key === "status" && visible.status) setStatuses([]); }}><Checkbox size="small" checked={visible[key]} />{labels[key]}</MenuItem>)}</Menu>
    <Menu anchorEl={sortAnchor} open={!!sortAnchor} onClose={() => setSortAnchor(null)}><MenuItem onClick={() => { if (sortKey) setSort({ key: sortKey, direction: "asc" }); setSortAnchor(null); }}>Asc</MenuItem><MenuItem onClick={() => { if (sortKey) setSort({ key: sortKey, direction: "desc" }); setSortAnchor(null); }}>Desc</MenuItem><Divider /><MenuItem onClick={() => { if (sortKey) setVisible((old) => ({ ...old, [sortKey]: false })); setSortAnchor(null); }}>Hide</MenuItem></Menu>
    <Menu anchorEl={rowAnchor} open={!!rowAnchor} onClose={closeRowMenu}><MenuItem onClick={() => { if (actionRow) router.push(`/crm/leads/${actionRow.id}`); closeRowMenu(); }}>View</MenuItem><MenuItem onClick={() => { setUpdateRow(actionRow); closeRowMenu(); }}>Update</MenuItem><Divider /><MenuItem onClick={() => { setDeleteRow(actionRow); closeRowMenu(); }}>Delete</MenuItem></Menu>
    <Drawer anchor="right" open={createOpen} onClose={() => setCreateOpen(false)} slotProps={{ paper: { sx: { width: { xs: "100%", md: 771 }, maxWidth: "100%" } } }}>
      <Stack direction="row" sx={{ p: 3, justifyContent: "space-between" }}><Box><Typography variant="h5">{t("leads.sheetTitle")}</Typography><Typography variant="body2" color="text.secondary">{t("leads.sheetDescription")}</Typography></Box><IconButton aria-label="Close" onClick={() => setCreateOpen(false)}><X size={18} /></IconButton></Stack><Divider />
      <Box sx={{ overflowY: "auto", py: 3 }}><NewLeadForm accounts={crmData.accounts} leadSources={crmData.leadSources} leadStatuses={crmData.leadStatuses} leadTypes={crmData.leadTypes} accountId={accountId} onFinish={closeCreate} /></Box>
    </Drawer>
    <Drawer anchor="right" open={!!updateRow} onClose={() => setUpdateRow(null)} slotProps={{ paper: { sx: { width: { xs: "100%", md: 771 }, maxWidth: "100%" } } }}>
      <Stack direction="row" sx={{ p: 3, justifyContent: "space-between" }}><Box><Typography variant="h5">Update lead - {updateRow && name(updateRow)}</Typography><Typography variant="body2" color="text.secondary">Update lead details</Typography></Box><IconButton aria-label="Close" onClick={() => setUpdateRow(null)}><X size={18} /></IconButton></Stack><Divider />
      <Box sx={{ overflowY: "auto", py: 3 }}>{updateRow && <UpdateLeadForm initialData={updateRow} setOpen={(open) => { if (!open) closeUpdate(); }} leadSources={crmData.leadSources} leadStatuses={crmData.leadStatuses} leadTypes={crmData.leadTypes} />}</Box>
    </Drawer>
    <Dialog open={!!deleteRow} onClose={() => { if (!deleting) setDeleteRow(null); }}><DialogTitle>Delete lead?</DialogTitle><DialogContent><DialogContentText>This will delete {deleteRow && name(deleteRow)}. This action cannot be undone.</DialogContentText></DialogContent><DialogActions><Button onClick={() => setDeleteRow(null)} disabled={deleting}>Cancel</Button><Button color="error" variant="contained" onClick={confirmDelete} disabled={deleting}>{deleting ? "Deleting..." : "Delete"}</Button></DialogActions></Dialog>
  </Paper>;
}
