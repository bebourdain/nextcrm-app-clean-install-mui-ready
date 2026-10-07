"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { Users } from "@prisma/client";
import { formatDistanceToNowStrict } from "date-fns";
import { ContentCopy, DeleteOutlined, MoreHoriz, ViewColumn } from "@mui/icons-material";
import { Box, Button, Checkbox, Chip, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, FormControl, IconButton, InputLabel, ListItemText, ListSubheader, Menu, MenuItem, OutlinedInput, Paper, Select, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TablePagination, TableRow, TableSortLabel, TextField, Tooltip, Typography } from "@mui/material";
import { toast } from "sonner";
import { activateUser } from "@/actions/admin/users/activate-user";
import { deactivateUser } from "@/actions/admin/users/deactivate-user";
import { deleteUser } from "@/actions/admin/users/delete-user";
import { setUserRole } from "@/actions/admin/users/set-role";

type Key = "created_on" | "lastLoginAt" | "name" | "email" | "role" | "userStatus" | "userLanguage";
const columns: { key: Key; title: string; sortable: boolean }[] = [
  { key: "created_on", title: "Date created", sortable: true },
  { key: "lastLoginAt", title: "Last login", sortable: false },
  { key: "name", title: "Name", sortable: true },
  { key: "email", title: "E-mail", sortable: true },
  { key: "role", title: "Role", sortable: true },
  { key: "userStatus", title: "Status", sortable: true },
  { key: "userLanguage", title: "Language", sortable: true },
];
const statuses = ["ACTIVE", "INACTIVE", "PENDING"];
const roles = ["admin", "manager", "user"];

function UserActions({ user }: { user: Users }) {
  const router = useRouter();
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [busy, setBusy] = useState(false);
  const run = async (action: () => Promise<{ error?: string }>, success: string) => {
    setBusy(true);
    setAnchor(null);
    try {
      const result = await action();
      if (result.error) toast.error(result.error);
      else { toast.success(success); router.refresh(); }
    } catch (error) {
      toast.error("Something went wrong: " + error + ". Please try again.");
    } finally { setBusy(false); }
  };
  const remove = async () => {
    await run(() => deleteUser(user.id), "User has been deleted");
    setConfirmDelete(false);
  };
  return <>
    <Tooltip title="User actions"><span><IconButton aria-label={`Actions for ${user.email}`} size="small" disabled={busy} onClick={(event) => setAnchor(event.currentTarget)}><MoreHoriz fontSize="small" /></IconButton></span></Tooltip>
    <Menu anchorEl={anchor} open={!!anchor} onClose={() => setAnchor(null)}>
      <MenuItem onClick={() => { void navigator.clipboard.writeText(user.id); toast.success("The URL has been copied to your clipboard."); setAnchor(null); }}><ContentCopy fontSize="small" sx={{ mr: 1 }} />Copy ID</MenuItem>
      <MenuItem onClick={() => void run(() => activateUser(user.id), "User has been activated.")}>Activate</MenuItem>
      <MenuItem onClick={() => void run(() => deactivateUser(user.id), "User has been deactivated.")}>Deactivate</MenuItem>
      <ListSubheader>Set Role</ListSubheader>
      {roles.map((role) => <MenuItem key={role} onClick={() => void run(() => setUserRole(user.id, role as "admin" | "manager" | "user"), `User role changed to ${role}.`)} sx={{ textTransform: "capitalize" }}>{role}</MenuItem>)}
      <MenuItem sx={{ color: "error.main" }} onClick={() => { setAnchor(null); setConfirmDelete(true); }}><DeleteOutlined fontSize="small" sx={{ mr: 1 }} />Delete</MenuItem>
    </Menu>
    <Dialog open={confirmDelete} onClose={() => setConfirmDelete(false)}><DialogTitle>Delete user?</DialogTitle><DialogContent><DialogContentText>Delete {user.email}?</DialogContentText></DialogContent><DialogActions><Button onClick={() => setConfirmDelete(false)} disabled={busy}>Cancel</Button><Button color="error" variant="contained" onClick={() => void remove()} disabled={busy}>{busy ? "Deleting..." : "Delete"}</Button></DialogActions></Dialog>
  </>;
}

export function AdminUserDataTable({ data }: { data: Users[] }) {
  const [name, setName] = useState("");
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [visible, setVisible] = useState<Key[]>(columns.map((column) => column.key));
  const [sortBy, setSortBy] = useState<Key | null>(null);
  const [direction, setDirection] = useState<"asc" | "desc">("asc");
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [viewAnchor, setViewAnchor] = useState<HTMLElement | null>(null);
  const [selection, setSelection] = useState<string[]>([]);

  const rows = useMemo(() => {
    const filtered = data.filter((user) =>
      (user.name ?? "").toLowerCase().includes(name.toLowerCase()) &&
      (!selectedStatuses.length || selectedStatuses.includes(user.userStatus)) &&
      (!selectedRoles.length || selectedRoles.includes(user.role ?? "user")));
    if (!sortBy) return filtered;
    return [...filtered].sort((a, b) => {
      const left = a[sortBy] ?? "";
      const right = b[sortBy] ?? "";
      const comparison = left instanceof Date && right instanceof Date
        ? left.getTime() - right.getTime()
        : String(left).localeCompare(String(right), undefined, { numeric: true, sensitivity: "base" });
      return direction === "asc" ? comparison : -comparison;
    });
  }, [data, name, selectedStatuses, selectedRoles, sortBy, direction]);
  const effectivePage = Math.min(page, Math.max(0, Math.ceil(rows.length / pageSize) - 1));
  const pageRows = rows.slice(effectivePage * pageSize, (effectivePage + 1) * pageSize);
  const selectedOnPage = pageRows.filter((user) => selection.includes(user.id)).length;
  const toggleAll = (checked: boolean) => setSelection((previous) => checked
    ? Array.from(new Set([...previous, ...pageRows.map((user) => user.id)]))
    : previous.filter((id) => !pageRows.some((user) => user.id === id)));
  const sort = (key: Key) => {
    if (sortBy === key) setDirection((previous) => previous === "asc" ? "desc" : "asc");
    else { setSortBy(key); setDirection("asc"); }
    setPage(0);
  };
  const reset = () => { setName(""); setSelectedStatuses([]); setSelectedRoles([]); setPage(0); };

  return <Paper variant="outlined">
    <Stack direction={{ xs: "column", md: "row" }} spacing={1.5} sx={{ p: 2, alignItems: { md: "center" } }}>
      <TextField label="Filter users" size="small" value={name} onChange={(event) => { setName(event.target.value); setPage(0); }} sx={{ minWidth: 200 }} />
      <FormControl size="small" sx={{ minWidth: 150 }}><InputLabel>Status</InputLabel><Select multiple value={selectedStatuses} onChange={(event) => { setSelectedStatuses(typeof event.target.value === "string" ? event.target.value.split(",") : event.target.value); setPage(0); }} input={<OutlinedInput label="Status" />} renderValue={(selected) => selected.join(", ")}>
        {statuses.map((status) => <MenuItem key={status} value={status}><Checkbox checked={selectedStatuses.includes(status)} size="small" /><ListItemText primary={status.charAt(0) + status.slice(1).toLowerCase()} /></MenuItem>)}
      </Select></FormControl>
      <FormControl size="small" sx={{ minWidth: 150 }}><InputLabel>Role</InputLabel><Select multiple value={selectedRoles} onChange={(event) => { setSelectedRoles(typeof event.target.value === "string" ? event.target.value.split(",") : event.target.value); setPage(0); }} input={<OutlinedInput label="Role" />} renderValue={(selected) => selected.join(", ")}>
        {roles.map((role) => <MenuItem key={role} value={role}><Checkbox checked={selectedRoles.includes(role)} size="small" /><ListItemText primary={role} /></MenuItem>)}
      </Select></FormControl>
      {(name || selectedStatuses.length || selectedRoles.length) ? <Button onClick={reset}>Reset</Button> : null}
      <Box sx={{ flexGrow: 1 }} />
      <Button variant="outlined" startIcon={<ViewColumn />} onClick={(event) => setViewAnchor(event.currentTarget)}>View</Button>
      <Menu anchorEl={viewAnchor} open={!!viewAnchor} onClose={() => setViewAnchor(null)}>
        <ListSubheader>Toggle columns</ListSubheader>
        {columns.filter((column) => column.key !== "lastLoginAt").map((column) => <MenuItem key={column.key} onClick={() => setVisible((previous) => previous.includes(column.key) ? previous.filter((key) => key !== column.key) : [...previous, column.key])}><Checkbox checked={visible.includes(column.key)} size="small" /><ListItemText primary={column.title} /></MenuItem>)}
      </Menu>
    </Stack>
    <TableContainer><Table size="small">
      <TableHead><TableRow><TableCell padding="checkbox"><Checkbox size="small" aria-label="Select all users on page" checked={!!pageRows.length && selectedOnPage === pageRows.length} indeterminate={selectedOnPage > 0 && selectedOnPage < pageRows.length} onChange={(_, checked) => toggleAll(checked)} /></TableCell>
        {columns.filter((column) => visible.includes(column.key)).map((column) => <TableCell key={column.key}>{column.sortable ? <TableSortLabel active={sortBy === column.key} direction={sortBy === column.key ? direction : "asc"} onClick={() => sort(column.key)}>{column.title}</TableSortLabel> : column.title}</TableCell>)}
        <TableCell align="right">Actions</TableCell>
      </TableRow></TableHead>
      <TableBody>{pageRows.map((user) => <TableRow key={user.id} hover selected={selection.includes(user.id)}>
        <TableCell padding="checkbox"><Checkbox size="small" aria-label={`Select ${user.email}`} checked={selection.includes(user.id)} onChange={(_, checked) => setSelection((previous) => checked ? [...previous, user.id] : previous.filter((id) => id !== user.id))} /></TableCell>
        {columns.filter((column) => visible.includes(column.key)).map((column) => <TableCell key={column.key}>
          {column.key === "created_on" ? new Date(user.created_on).toLocaleString() :
            column.key === "lastLoginAt" ? (user.lastLoginAt ? formatDistanceToNowStrict(new Date(user.lastLoginAt), { addSuffix: true }) : "Never") :
            column.key === "userStatus" ? <Chip size="small" label={user.userStatus.charAt(0) + user.userStatus.slice(1).toLowerCase()} color={user.userStatus === "ACTIVE" ? "success" : user.userStatus === "PENDING" ? "warning" : "default"} /> :
            column.key === "role" ? user.role ?? "user" : user[column.key] ?? "—"}
        </TableCell>)}
        <TableCell align="right"><UserActions user={user} /></TableCell>
      </TableRow>)}{!pageRows.length && <TableRow><TableCell colSpan={visible.length + 2} align="center" sx={{ py: 5 }}><Typography color="text.secondary">No results.</Typography></TableCell></TableRow>}</TableBody>
    </Table></TableContainer>
    <Stack direction="row" sx={{ alignItems: "center", justifyContent: "space-between", pl: 2, flexWrap: "wrap" }}>
      <Typography variant="body2" color="text.secondary">{selection.filter((id) => rows.some((user) => user.id === id)).length} of {rows.length} row(s) selected.</Typography>
      <TablePagination component="div" count={rows.length} page={effectivePage} onPageChange={(_, value) => setPage(value)} rowsPerPage={pageSize} onRowsPerPageChange={(event) => { setPageSize(Number(event.target.value)); setPage(0); }} rowsPerPageOptions={[10, 20, 30, 40, 50]} />
    </Stack>
  </Paper>;
}
