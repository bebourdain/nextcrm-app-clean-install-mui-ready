"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import moment from "moment";
import { toast } from "sonner";
import { ChevronLeft, ChevronRight, MoreHorizontal, PanelTopClose, PanelTopOpen, X } from "lucide-react";
import { Box, Button, Checkbox, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Divider, Drawer, IconButton, Menu, MenuItem, Paper, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Typography, Select } from "@mui/material";
import { MuiPageHeader } from "@/components/mui/MuiPageHeader";
import { deleteAccount } from "@/actions/crm/accounts/delete-account";
import { watchAccount } from "@/actions/crm/accounts/watch-account";
import { unwatchAccount } from "@/actions/crm/accounts/unwatch-account";
import { NewAccountForm } from "../accounts/components/NewAccountForm";
import { UpdateAccountForm } from "../accounts/components/UpdateAccountForm";
import { statuses } from "../accounts/table-data/data";
import type { getAllCrmData } from "@/actions/crm/get-crm-data";

type CrmData = Awaited<ReturnType<typeof getAllCrmData>>;
type Account = { id: string; name: string; createdAt?: Date | string | null; email?: string | null; status?: string | null; assigned_to_user?: { name?: string | null } | null; contacts?: { first_name?: string | null; last_name?: string | null }[] };
type Column = "assigned_to_user" | "name" | "email" | "contacts" | "status";
const labels: Record<Column, string> = { assigned_to_user: "Assigned to", name: "Name", email: "E-mail", contacts: "Account contact", status: "Status" };

export default function AccountsView({ data, crmData }: { data: Account[]; crmData: CrmData }) {
  const router = useRouter();
  const t = useTranslations("CrmPage");
  const [search, setSearch] = useState("");
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [visible, setVisible] = useState<Record<Column, boolean>>({ assigned_to_user: true, name: true, email: true, contacts: true, status: true });
  const [sort, setSort] = useState<{ key: Column; direction: "asc" | "desc" } | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [hidden, setHidden] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [updateRow, setUpdateRow] = useState<Account | null>(null);
  const [deleteRow, setDeleteRow] = useState<Account | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [statusAnchor, setStatusAnchor] = useState<HTMLElement | null>(null);
  const [viewAnchor, setViewAnchor] = useState<HTMLElement | null>(null);
  const [rowAnchor, setRowAnchor] = useState<HTMLElement | null>(null);
  const [actionRow, setActionRow] = useState<Account | null>(null);
  const filtered = useMemo(() => {
    const result = data.filter((account) => account.name.toLowerCase().includes(search.trim().toLowerCase()) && (!selectedStatuses.length || selectedStatuses.includes(account.status || "")));
    if (!sort) return result;
    return result.sort((a, b) => {
      const value = (record: Account) => sort.key === "assigned_to_user" ? record.assigned_to_user?.name || "" : sort.key === "contacts" ? (record.contacts || []).map((contact) => `${contact.first_name || ""} ${contact.last_name || ""}`).join(", ") : String(record[sort.key] || "");
      return value(a).localeCompare(value(b)) * (sort.direction === "asc" ? 1 : -1);
    });
  }, [data, search, selectedStatuses, sort]);
  const pageCount = Math.max(1, Math.ceil(filtered.length / rowsPerPage));
  const currentPage = Math.min(page, pageCount - 1);
  const closeRowMenu = () => { setRowAnchor(null); setActionRow(null); };
  const refreshAndClose = () => { setCreateOpen(false); setUpdateRow(null); router.refresh(); };
  const accountAction = async (kind: "watch" | "unwatch") => {
    if (!actionRow) return;
    const id = actionRow.id;
    closeRowMenu();
    try {
      const result = await (kind === "watch" ? watchAccount(id) : unwatchAccount(id));
      if (result.error) toast.error("Error");
      else toast.success(kind === "watch" ? "You are now an account watcher" : "You are no longer an account watcher");
    } catch { toast.error("Error"); }
  };
  const confirmDelete = async () => {
    if (!deleteRow) return;
    setDeleting(true);
    try {
      const result = await deleteAccount(deleteRow.id);
      if (result.error) toast.error(result.error);
      else { toast.success("Account has been deleted"); router.refresh(); }
    } catch { toast.error("Something went wrong while deleting account. Please try again."); }
    finally { setDeleting(false); setDeleteRow(null); }
  };
  const drawerProps = { paper: { sx: { width: { xs: "100%", md: 771 }, maxWidth: "100%" } } };
  return <Box sx={{ width: "100%", pb: 6 }}>
    <MuiPageHeader title={t("accounts.pageTitle")} description={t("accounts.pageDescription")} />
    <Divider sx={{ my: 2 }} />
    <Paper variant="outlined" sx={{ borderRadius: "var(--radius)", overflow: "hidden" }}>
      <Box sx={{ p: 3, pb: 1.5 }}><Stack direction="row" sx={{ alignItems: "center", justifyContent: "space-between" }}><Typography component="h2" variant="h5" sx={{ fontWeight: 600 }}>{t("accounts.viewTitle")}</Typography><Button variant="contained" aria-label={t("accounts.addNew")} data-testid="add-account-btn" onClick={() => setCreateOpen(true)} sx={{ minWidth: 36 }}>+</Button></Stack><Divider sx={{ mt: 2.5 }} /></Box>
      <Box sx={{ px: 3, pb: 3 }}>
        <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 1 }}><IconButton size="small" aria-label={hidden ? "Show table content" : "Hide table content"} onClick={() => setHidden(!hidden)}>{hidden ? <PanelTopOpen size={18} /> : <PanelTopClose size={18} />}</IconButton></Box>
        {hidden ? <Typography variant="body2">This content is hidden now. Use the icon above to show content.</Typography> : !data.length ? <Typography variant="body2">{t("accounts.empty")}</Typography> : <>
          <Stack direction={{ xs: "column", md: "row" }} spacing={1} sx={{ alignItems: { md: "center" } }}>
            <TextField size="small" value={search} onChange={(event) => { setSearch(event.target.value); setPage(0); }} placeholder="Filter accounts..." aria-label="Filter accounts" sx={{ width: { xs: "100%", md: 250 } }} />
            {visible.status && <Button variant="outlined" onClick={(event) => setStatusAnchor(event.currentTarget)}>Status{selectedStatuses.length ? ` · ${selectedStatuses.length} selected` : ""}</Button>}
            {(search || selectedStatuses.length > 0) && <Button onClick={() => { setSearch(""); setSelectedStatuses([]); setPage(0); }}>Reset</Button>}
            <Box sx={{ flex: 1 }} /><Button variant="outlined" onClick={(event) => setViewAnchor(event.currentTarget)}>View</Button>
          </Stack>
          <TableContainer sx={{ mt: 2, border: 1, borderColor: "divider", borderRadius: 1 }}><Table data-testid="accounts-table" sx={{ minWidth: 950 }}><TableHead><TableRow><TableCell>Created</TableCell>{(Object.keys(labels) as Column[]).filter((key) => visible[key]).map((key) => <TableCell key={key}><Button size="small" color="inherit" onClick={() => setSort({ key, direction: sort?.key === key && sort.direction === "asc" ? "desc" : "asc" })}>{labels[key]}{sort?.key === key ? sort.direction === "asc" ? " ↑" : " ↓" : ""}</Button></TableCell>)}<TableCell aria-label="Actions" /></TableRow></TableHead><TableBody>
            {filtered.slice(currentPage * rowsPerPage, (currentPage + 1) * rowsPerPage).map((account) => <TableRow key={account.id} hover><TableCell>{account.createdAt ? moment(account.createdAt).format("YY/MM/DD-HH:mm") : "—"}</TableCell>{visible.assigned_to_user && <TableCell>{account.assigned_to_user?.name || "Unassigned"}</TableCell>}{visible.name && <TableCell><Button component={Link} href={`/crm/accounts/${account.id}`} data-testid="account-row-name" color="inherit" sx={{ textTransform: "none" }}>{account.name}</Button></TableCell>}{visible.email && <TableCell>{account.email || "—"}</TableCell>}{visible.contacts && <TableCell>{account.contacts?.map((contact) => `${contact.first_name || ""} ${contact.last_name || ""}`.trim()).join(", ") || "—"}</TableCell>}{visible.status && <TableCell>{statuses.find((status) => status.value === account.status)?.label || account.status || "—"}</TableCell>}<TableCell><IconButton aria-label={`Actions for ${account.name}`} size="small" onClick={(event) => { setActionRow(account); setRowAnchor(event.currentTarget); }}><MoreHorizontal size={18} /></IconButton></TableCell></TableRow>)}
            {!filtered.length && <TableRow><TableCell colSpan={Object.values(visible).filter(Boolean).length + 2} align="center">No results.</TableCell></TableRow>}
          </TableBody></Table></TableContainer>
          <Stack direction="row" spacing={1} sx={{ mt: 2, justifyContent: "flex-end", alignItems: "center" }}><Typography variant="body2">Rows per page</Typography><Select size="small" value={rowsPerPage} onChange={(event) => { setRowsPerPage(Number(event.target.value)); setPage(0); }}>{[10, 20, 30, 40, 50].map((count) => <MenuItem key={count} value={count}>{count}</MenuItem>)}</Select><Typography variant="body2">Page {currentPage + 1} of {pageCount}</Typography><IconButton aria-label="Previous page" disabled={currentPage === 0} onClick={() => setPage(currentPage - 1)}><ChevronLeft size={18} /></IconButton><IconButton aria-label="Next page" disabled={currentPage >= pageCount - 1} onClick={() => setPage(currentPage + 1)}><ChevronRight size={18} /></IconButton></Stack>
        </>}
      </Box>
    </Paper>
    <Menu anchorEl={statusAnchor} open={Boolean(statusAnchor)} onClose={() => setStatusAnchor(null)}>{statuses.map((status) => <MenuItem key={status.value} onClick={() => { setSelectedStatuses((current) => current.includes(status.value) ? current.filter((value) => value !== status.value) : [...current, status.value]); setPage(0); }}><Checkbox size="small" checked={selectedStatuses.includes(status.value)} />{status.label}</MenuItem>)}</Menu>
    <Menu anchorEl={viewAnchor} open={Boolean(viewAnchor)} onClose={() => setViewAnchor(null)}>{(Object.keys(labels) as Column[]).map((key) => <MenuItem key={key} onClick={() => { setVisible((current) => ({ ...current, [key]: !current[key] })); if (key === "status" && visible.status) setSelectedStatuses([]); }}><Checkbox size="small" checked={visible[key]} />{labels[key]}</MenuItem>)}</Menu>
    <Menu anchorEl={rowAnchor} open={Boolean(rowAnchor)} onClose={closeRowMenu}><MenuItem onClick={() => { if (actionRow) router.push(`/crm/accounts/${actionRow.id}`); closeRowMenu(); }}>View</MenuItem><MenuItem onClick={() => { setUpdateRow(actionRow); closeRowMenu(); }}>Update</MenuItem><Divider /><MenuItem onClick={() => void accountAction("watch")}>Watch Account</MenuItem><MenuItem onClick={() => void accountAction("unwatch")}>Stop watching Account</MenuItem><Divider /><MenuItem onClick={() => { setDeleteRow(actionRow); closeRowMenu(); }}>Delete</MenuItem></Menu>
    <Drawer anchor="right" open={createOpen} onClose={() => setCreateOpen(false)} slotProps={drawerProps}><Box sx={{ p: 3, display: "flex", justifyContent: "space-between" }}><Box><Typography variant="h5">{t("accounts.sheetTitle")}</Typography><Typography variant="body2" color="text.secondary">{t("accounts.sheetDescription")}</Typography></Box><IconButton aria-label="Close" onClick={() => setCreateOpen(false)}><X size={18} /></IconButton></Box><Divider /><Box sx={{ overflowY: "auto", py: 3 }}><NewAccountForm industries={crmData.industries} onFinish={refreshAndClose} /></Box></Drawer>
    <Drawer anchor="right" open={Boolean(updateRow)} onClose={() => setUpdateRow(null)} slotProps={drawerProps}><Box sx={{ p: 3, display: "flex", justifyContent: "space-between" }}><Box><Typography variant="h5">Update Account - {updateRow?.name}</Typography><Typography variant="body2" color="text.secondary">Update account details</Typography></Box><IconButton aria-label="Close" onClick={() => setUpdateRow(null)}><X size={18} /></IconButton></Box><Divider /><Box sx={{ overflowY: "auto", py: 3 }}>{updateRow && <UpdateAccountForm initialData={updateRow} open={(open) => { if (!open) refreshAndClose(); }} />}</Box></Drawer>
    <Dialog open={Boolean(deleteRow)} onClose={() => { if (!deleting) setDeleteRow(null); }}><DialogTitle>Delete account?</DialogTitle><DialogContent><DialogContentText>This will delete {deleteRow?.name}. This action cannot be undone.</DialogContentText></DialogContent><DialogActions><Button onClick={() => setDeleteRow(null)} disabled={deleting}>Cancel</Button><Button variant="contained" color="error" disabled={deleting} onClick={confirmDelete}>{deleting ? "Deleting..." : "Delete"}</Button></DialogActions></Dialog>
  </Box>;
}
