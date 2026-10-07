"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import moment from "moment";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { ArrowDown, ArrowUp, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, MoreHorizontal, PanelTopClose, PanelTopOpen, SlidersHorizontal, X } from "lucide-react";
import { Box, Button, Checkbox, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Divider, IconButton, Menu, MenuItem, Paper, Select, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Typography } from "@mui/material";
import type { getAllCrmData } from "@/actions/crm/get-crm-data";
import { deleteContract } from "@/actions/crm/contracts/delete-contract";
import CreateContractForm from "../contracts/_forms/create-contract";
import UpdateContractForm from "../contracts/_forms/update-contract";
import { statuses } from "../contracts/table-data/data";

type CrmData = Awaited<ReturnType<typeof getAllCrmData>>;
type Contract = {
  id: string; v: number; title: string; status: string; createdAt: Date | string | null; updatedAt: Date | string | null;
  customerSignedDate: Date | string | null; assigned_to_user?: { name: string | null } | null;
  assigned_account?: { name: string | null } | null;
  [key: string]: any;
};
type OptionalColumn = "title" | "assigned_to_user" | "company" | "status";
type SortColumn = "title" | "assigned_to_user" | "status";
const labels: Record<OptionalColumn, string> = { title: "Title", assigned_to_user: "Assigned to", company: "Company", status: "Status" };
const columns: OptionalColumn[] = ["title", "assigned_to_user", "company", "status"];
const date = (value: Date | string | null) => value ? moment(value).format("YY-MM-DD") : "—";
const compact = { height: 32, borderRadius: "calc(var(--radius) - 2px)", borderColor: "divider", color: "text.primary", fontSize: 14 };

export default function ContractsView({ data, crmData, accountId }: { data: Contract[]; crmData: CrmData; accountId?: string }) {
  const router = useRouter();
  const t = useTranslations("CrmPage");
  const [search, setSearch] = useState("");
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [visible, setVisible] = useState<Record<OptionalColumn, boolean>>({ title: true, assigned_to_user: true, company: true, status: true });
  const [sortKey, setSortKey] = useState<SortColumn | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [sortColumn, setSortColumn] = useState<SortColumn | null>(null);
  const [sortAnchor, setSortAnchor] = useState<HTMLElement | null>(null);
  const [statusAnchor, setStatusAnchor] = useState<HTMLElement | null>(null);
  const [viewAnchor, setViewAnchor] = useState<HTMLElement | null>(null);
  const [rowAnchor, setRowAnchor] = useState<HTMLElement | null>(null);
  const [actionRow, setActionRow] = useState<Contract | null>(null);
  const [updateRow, setUpdateRow] = useState<Contract | null>(null);
  const [deleteRow, setDeleteRow] = useState<Contract | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [hide, setHide] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const records = useMemo(() => {
    const result = data.filter((record) => record.title.toLowerCase().includes(search.trim().toLowerCase()) &&
      (!selectedStatuses.length || selectedStatuses.includes(record.status)));
    if (!sortKey) return result;
    return result.sort((left, right) => {
      const value = (item: Contract) => sortKey === "assigned_to_user" ? item.assigned_to_user?.name ?? "" : item[sortKey] ?? "";
      const comparison = String(value(left)).localeCompare(String(value(right)));
      return sortDirection === "asc" ? comparison : -comparison;
    });
  }, [data, search, selectedStatuses, sortKey, sortDirection]);
  const pageCount = Math.max(1, Math.ceil(records.length / rowsPerPage));
  const currentPage = Math.min(page, pageCount - 1);
  const colSpan = 4 + columns.filter((column) => visible[column]).length;
  const closeMenu = () => { setRowAnchor(null); setActionRow(null); };
  const confirmDelete = async () => {
    if (!deleteRow) return;
    setDeleting(true);
    try {
      const result = await deleteContract({ id: deleteRow.id });
      if (result?.error) toast.error(result.error);
      else { toast.success("Contract has been deleted"); router.refresh(); }
    } catch { toast.error("Something went wrong while deleting contract. Please try again."); }
    finally { setDeleting(false); setDeleteRow(null); }
  };
  const sortHeader = (key: SortColumn, label: string) => <Button variant="text" onClick={(event) => { setSortColumn(key); setSortAnchor(event.currentTarget); }} sx={{ minWidth: 0, px: 1, color: "text.secondary", fontSize: 14, fontWeight: 500 }}>
    {label}{sortKey === key ? sortDirection === "asc" ? <ArrowUp size={14} style={{ marginLeft: 8 }} /> : <ArrowDown size={14} style={{ marginLeft: 8 }} /> : <ArrowDown size={14} style={{ marginLeft: 8, opacity: 0.5 }} />}
  </Button>;
  return <>
    <Paper variant="outlined" sx={{ borderRadius: "var(--radius)", overflow: "hidden", boxShadow: "0 1px 2px 0 rgb(0 0 0 / 0.05)" }}>
      <Box sx={{ p: 3, pb: 1.5 }}>
        <Stack direction="row" sx={{ alignItems: "center", justifyContent: "space-between" }}>
          <Typography variant="h5" component="h2" sx={{ fontWeight: 600 }}><Link href="/crm/contracts" style={{ color: "inherit", textDecoration: "none" }}>{t("contracts.viewTitle")}</Link></Typography>
          <CreateContractForm accounts={crmData.accounts} accountId={accountId ?? ""} currencies={crmData.currencies} />
        </Stack>
        <Divider sx={{ mt: 2.5 }} />
      </Box>
      <Box sx={{ px: 3, pb: 3 }}>
        <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 1 }}><IconButton size="small" aria-label={hide ? "Show table content" : "Hide table content"} onClick={() => setHide(!hide)}>{hide ? <PanelTopOpen size={18} /> : <PanelTopClose size={18} />}</IconButton></Box>
        {hide ? <Typography variant="body2">This content is hidden now. Use the icon above to show content.</Typography> : data.length === 0 ? <Typography variant="body2">{t("contracts.empty")}</Typography> : <>
          <Stack direction={{ xs: "column", md: "row" }} spacing={1} sx={{ alignItems: { md: "center" } }}>
            <TextField size="small" placeholder="Filter contracts..." aria-label="Filter contracts" value={search} onChange={(event) => { setSearch(event.target.value); setPage(0); }} sx={{ width: { xs: "100%", md: 250 }, "& .MuiInputBase-root": { height: 32 } }} />
            {visible.status && <Button variant="outlined" onClick={(event) => setStatusAnchor(event.currentTarget)} sx={{ ...compact, borderStyle: "dashed" }}>Status{selectedStatuses.length ? ` · ${selectedStatuses.length} selected` : ""}</Button>}
            {(search || selectedStatuses.length > 0) && <Button onClick={() => { setSearch(""); setSelectedStatuses([]); setPage(0); }} endIcon={<X size={14} />}>Reset</Button>}
            <Box sx={{ flex: 1 }} />
            <Button variant="outlined" startIcon={<SlidersHorizontal size={16} />} onClick={(event) => setViewAnchor(event.currentTarget)} sx={compact}>View</Button>
          </Stack>
          <TableContainer sx={{ mt: 2, border: 1, borderColor: "divider", borderRadius: 1 }}><Table data-testid="contracts-table" sx={{ minWidth: 980, "& .MuiTableCell-head": { height: 48, fontSize: 14, fontWeight: 500, color: "text.secondary" }, "& .MuiTableCell-body": { fontSize: 14 } }}>
            <TableHead><TableRow><TableCell>Created</TableCell><TableCell>Last update</TableCell><TableCell>Customer signed</TableCell>{visible.title && <TableCell>{sortHeader("title", "Title")}</TableCell>}{visible.assigned_to_user && <TableCell>{sortHeader("assigned_to_user", "Assigned to")}</TableCell>}{visible.company && <TableCell>Company</TableCell>}{visible.status && <TableCell>{sortHeader("status", "Status")}</TableCell>}<TableCell aria-label="Actions" /></TableRow></TableHead>
            <TableBody>{records.slice(currentPage * rowsPerPage, (currentPage + 1) * rowsPerPage).map((record) => {
              const status = statuses.find((item) => item.value === record.status);
              return <TableRow key={record.id} hover><TableCell>{date(record.createdAt)}</TableCell><TableCell>{date(record.updatedAt)}</TableCell><TableCell>{record.customerSignedDate ? date(record.customerSignedDate) : "Not signed yet"}</TableCell>
                {visible.title && <TableCell><Button component={Link} href={`/crm/contracts/${record.id}`} variant="text" sx={{ p: 0, minWidth: 0, color: "text.primary", textTransform: "none", fontWeight: 400 }}>{record.title}</Button></TableCell>}
                {visible.assigned_to_user && <TableCell>{record.assigned_to_user?.name ?? "Unassigned"}</TableCell>}
                {visible.company && <TableCell>{record.assigned_account?.name ?? "Unassigned"}</TableCell>}
                {visible.status && <TableCell>{status?.label ?? record.status}</TableCell>}
                <TableCell><IconButton size="small" aria-label={`Actions for ${record.title}`} onClick={(event) => { setActionRow(record); setRowAnchor(event.currentTarget); }}><MoreHorizontal size={16} /></IconButton></TableCell>
              </TableRow>;
            })}{records.length === 0 && <TableRow><TableCell colSpan={colSpan} align="center" sx={{ py: 5 }}>No results.</TableCell></TableRow>}</TableBody>
          </Table></TableContainer>
          <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}><Stack direction="row" spacing={2} sx={{ alignItems: "center" }}><Typography variant="body2">Rows per page</Typography><Select size="small" value={rowsPerPage} onChange={(event) => { setRowsPerPage(Number(event.target.value)); setPage(0); }} sx={{ height: 32, width: 70 }}>{[10, 20, 30, 40, 50].map((count) => <MenuItem key={count} value={count}>{count}</MenuItem>)}</Select><Typography variant="body2">Page {currentPage + 1} of {pageCount}</Typography><IconButton aria-label="First page" disabled={!currentPage} onClick={() => setPage(0)}><ChevronsLeft size={16} /></IconButton><IconButton aria-label="Previous page" disabled={!currentPage} onClick={() => setPage(currentPage - 1)}><ChevronLeft size={16} /></IconButton><IconButton aria-label="Next page" disabled={currentPage >= pageCount - 1} onClick={() => setPage(currentPage + 1)}><ChevronRight size={16} /></IconButton><IconButton aria-label="Last page" disabled={currentPage >= pageCount - 1} onClick={() => setPage(pageCount - 1)}><ChevronsRight size={16} /></IconButton></Stack></Box>
        </>}
      </Box>
    </Paper>
    <Menu anchorEl={statusAnchor} open={!!statusAnchor} onClose={() => setStatusAnchor(null)}>{statuses.map((status) => <MenuItem key={status.value} onClick={() => { setSelectedStatuses((current) => current.includes(status.value) ? current.filter((value) => value !== status.value) : [...current, status.value]); setPage(0); }}><Checkbox size="small" checked={selectedStatuses.includes(status.value)} />{status.label}</MenuItem>)}</Menu>
    <Menu anchorEl={viewAnchor} open={!!viewAnchor} onClose={() => setViewAnchor(null)}><MenuItem disabled>Toggle columns</MenuItem><Divider />{columns.map((column) => <MenuItem key={column} onClick={() => { setVisible((current) => ({ ...current, [column]: !current[column] })); if (column === "status" && visible.status) setSelectedStatuses([]); }}><Checkbox size="small" checked={visible[column]} />{labels[column]}</MenuItem>)}</Menu>
    <Menu anchorEl={sortAnchor} open={!!sortAnchor} onClose={() => setSortAnchor(null)}><MenuItem onClick={() => { if (sortColumn) { setSortKey(sortColumn); setSortDirection("asc"); } setSortAnchor(null); }}>Ascending</MenuItem><MenuItem onClick={() => { if (sortColumn) { setSortKey(sortColumn); setSortDirection("desc"); } setSortAnchor(null); }}>Descending</MenuItem><Divider /><MenuItem onClick={() => { if (sortColumn) setVisible((current) => ({ ...current, [sortColumn]: false })); setSortAnchor(null); }}>Hide</MenuItem></Menu>
    <Menu anchorEl={rowAnchor} open={!!rowAnchor} onClose={closeMenu}><MenuItem onClick={() => { if (actionRow) router.push(`/crm/contracts/${actionRow.id}`); closeMenu(); }}>View</MenuItem><MenuItem onClick={() => { setUpdateRow(actionRow); closeMenu(); }}>Update</MenuItem><Divider /><MenuItem onClick={() => { setDeleteRow(actionRow); closeMenu(); }}>Delete</MenuItem></Menu>
    {updateRow && <UpdateContractForm onOpen setOpen={(open) => { if (!open) { setUpdateRow(null); router.refresh(); } }} data={updateRow} />}
    <Dialog open={!!deleteRow} onClose={() => { if (!deleting) setDeleteRow(null); }}><DialogTitle>Delete contract?</DialogTitle><DialogContent><DialogContentText>This will delete {deleteRow?.title}. This action cannot be undone.</DialogContentText></DialogContent><DialogActions><Button onClick={() => setDeleteRow(null)} disabled={deleting}>Cancel</Button><Button color="error" variant="contained" onClick={confirmDelete} disabled={deleting}>{deleting ? "Deleting..." : "Delete"}</Button></DialogActions></Dialog>
  </>;
}
