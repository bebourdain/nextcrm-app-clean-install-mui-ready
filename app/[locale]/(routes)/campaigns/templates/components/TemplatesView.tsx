"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { MoreHoriz } from "@mui/icons-material";
import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, IconButton, Menu, MenuItem, Paper, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TablePagination, TableRow, TableSortLabel, TextField, Typography } from "@mui/material";
import { toast } from "sonner";
import { deleteTemplate } from "@/actions/campaigns/templates/delete-template";

type Template = {
  id: string;
  name: string;
  description: string | null;
  subject_default: string | null;
  content_html: string;
  content_json: unknown;
  created_by: string | null;
  created_on: Date | null;
  updatedAt: Date | null;
  created_by_user: { name: string | null } | null;
};

type SortKey = "name" | "subject_default" | "created_on";

function TemplateRowActions({ template }: { template: Template }) {
  const router = useRouter();
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const onDelete = async () => {
    setDeleting(true);
    try {
      const result = await deleteTemplate(template.id);
      if ("error" in result) { toast.error(result.error); return; }
      toast.success("Template has been deleted");
      setConfirmOpen(false);
      router.refresh();
    } catch {
      toast.error("Could not delete template. Please try again.");
    } finally { setDeleting(false); }
  };

  return <>
    <IconButton size="small" aria-label={`Actions for ${template.name}`} onClick={(event) => setAnchor(event.currentTarget)}><MoreHoriz fontSize="small" /></IconButton>
    <Menu anchorEl={anchor} open={Boolean(anchor)} onClose={() => setAnchor(null)}>
      <MenuItem onClick={() => { setAnchor(null); router.push(`/campaigns/templates/${template.id}`); }}>Edit</MenuItem>
      <MenuItem sx={{ color: "error.main" }} onClick={() => { setAnchor(null); setConfirmOpen(true); }}>Delete</MenuItem>
    </Menu>
    <Dialog open={confirmOpen} onClose={() => { if (!deleting) setConfirmOpen(false); }}>
      <DialogTitle>Delete template?</DialogTitle>
      <DialogContent><DialogContentText>This will delete {template.name}. This action cannot be undone.</DialogContentText></DialogContent>
      <DialogActions><Button onClick={() => setConfirmOpen(false)} disabled={deleting}>Cancel</Button><Button color="error" variant="contained" onClick={onDelete} disabled={deleting}>{deleting ? "Deleting…" : "Delete"}</Button></DialogActions>
    </Dialog>
  </>;
}

export default function TemplatesView({ data }: { data: Template[] }) {
  const [query, setQuery] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("created_on");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const rows = useMemo(() => data.filter((template) => template.name.toLowerCase().includes(query.trim().toLowerCase())).sort((a, b) => {
    const left = sortKey === "created_on" ? new Date(a.created_on ?? 0).getTime() : a[sortKey] ?? "";
    const right = sortKey === "created_on" ? new Date(b.created_on ?? 0).getTime() : b[sortKey] ?? "";
    const comparison = left < right ? -1 : left > right ? 1 : 0;
    return sortDirection === "asc" ? comparison : -comparison;
  }), [data, query, sortKey, sortDirection]);

  const sort = (key: SortKey) => {
    if (sortKey === key) setSortDirection((current) => current === "asc" ? "desc" : "asc");
    else { setSortKey(key); setSortDirection("asc"); }
    setPage(0);
  };
  const headers: { label: string; key?: SortKey }[] = [
    { label: "Name", key: "name" }, { label: "Subject Default", key: "subject_default" },
    { label: "Created By" }, { label: "Created On", key: "created_on" },
  ];

  return <Paper variant="outlined" sx={{ p: 3, borderRadius: "var(--radius)", boxShadow: "0 1px 2px 0 rgb(0 0 0 / 0.05)" }}>
    <Typography variant="h5" component="h2" sx={{ fontWeight: 600, mb: 3 }}>Templates</Typography>
    <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
      <TextField size="small" label="Filter by name" value={query} onChange={(event) => { setQuery(event.target.value); setPage(0); }} sx={{ width: { xs: "100%", sm: 250 } }} />
      {query && <Button color="inherit" onClick={() => { setQuery(""); setPage(0); }}>Reset</Button>}
    </Stack>
    <TableContainer sx={{ border: 1, borderColor: "divider", borderRadius: "var(--radius)" }}>
      <Table size="small" data-testid="templates-table">
        <TableHead><TableRow>{headers.map((header) => <TableCell key={header.label} sortDirection={header.key === sortKey ? sortDirection : false}>
          {header.key ? <TableSortLabel active={header.key === sortKey} direction={header.key === sortKey ? sortDirection : "asc"} onClick={() => sort(header.key!)}>{header.label}</TableSortLabel> : header.label}
        </TableCell>)}<TableCell align="right">Actions</TableCell></TableRow></TableHead>
        <TableBody>{rows.length ? rows.slice(page * rowsPerPage, (page + 1) * rowsPerPage).map((template) => <TableRow key={template.id} hover>
          <TableCell><Typography component={Link} href={`/campaigns/templates/${template.id}`} sx={{ color: "primary.main", fontWeight: 600, textDecoration: "none", "&:hover": { textDecoration: "underline" } }}>{template.name}</Typography></TableCell>
          <TableCell>{template.subject_default || "—"}</TableCell>
          <TableCell>{template.created_by_user?.name || "—"}</TableCell>
          <TableCell sx={{ whiteSpace: "nowrap" }}>{template.created_on ? new Intl.DateTimeFormat("en-US", { dateStyle: "medium" }).format(new Date(template.created_on)) : "—"}</TableCell>
          <TableCell align="right"><TemplateRowActions template={template} /></TableCell>
        </TableRow>) : <TableRow><TableCell colSpan={5} align="center" sx={{ py: 5 }}><Typography color="text.secondary">{data.length ? "No results." : "No templates found"}</Typography></TableCell></TableRow>}</TableBody>
      </Table>
      <TablePagination component="div" count={rows.length} page={Math.min(page, Math.max(0, Math.ceil(rows.length / rowsPerPage) - 1))} rowsPerPage={rowsPerPage} onPageChange={(_, next) => setPage(next)} onRowsPerPageChange={(event) => { setRowsPerPage(Number(event.target.value)); setPage(0); }} rowsPerPageOptions={[10, 20, 30, 40, 50]} showFirstButton showLastButton />
    </TableContainer>
  </Paper>;
}
