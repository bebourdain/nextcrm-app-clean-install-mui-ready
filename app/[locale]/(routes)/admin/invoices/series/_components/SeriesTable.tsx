"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Add, DeleteOutlined, EditOutlined } from "@mui/icons-material";
import { Box, Button, Chip, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, FormControlLabel, IconButton, MenuItem, Stack, Switch, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Typography } from "@mui/material";
import { toast } from "sonner";

interface Series { id: string; name: string; prefixTemplate: string; resetPolicy: string; isDefault: boolean; active: boolean }
const RESET_POLICIES = ["YEARLY", "MONTHLY", "NEVER"] as const;

export function SeriesTable({ series }: { series: Series[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [prefixTemplate, setPrefixTemplate] = useState("");
  const [resetPolicy, setResetPolicy] = useState("YEARLY");
  const [isDefault, setIsDefault] = useState(false);
  const [active, setActive] = useState(true);
  const [deleting, setDeleting] = useState<Series | null>(null);
  const [busy, setBusy] = useState(false);

  const reset = () => { setEditId(null); setName(""); setPrefixTemplate(""); setResetPolicy("YEARLY"); setIsDefault(false); setActive(true); };
  const edit = (item: Series) => { setEditId(item.id); setName(item.name); setPrefixTemplate(item.prefixTemplate); setResetPolicy(item.resetPolicy); setIsDefault(item.isDefault); setActive(item.active); setOpen(true); };
  const close = () => { setOpen(false); reset(); };
  const save = async () => {
    setBusy(true);
    try {
      const response = await fetch(editId ? `/api/admin/invoices/series/${editId}` : "/api/admin/invoices/series", { method: editId ? "PATCH" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name, prefixTemplate, resetPolicy, isDefault, active }) });
      if (!response.ok) throw new Error(await response.text());
      toast.success(editId ? "Series updated" : "Series created"); close(); router.refresh();
    } catch { toast.error("Failed to save series"); }
    finally { setBusy(false); }
  };
  const remove = async () => {
    if (!deleting) return;
    setBusy(true);
    try {
      const response = await fetch(`/api/admin/invoices/series/${deleting.id}`, { method: "DELETE" });
      if (!response.ok) throw new Error(await response.text());
      toast.success("Series deleted"); setDeleting(null); router.refresh();
    } catch { toast.error("Failed to delete series"); }
    finally { setBusy(false); }
  };

  return <Stack spacing={2}>
    <TableContainer sx={{ border: 1, borderColor: "divider", borderRadius: 1 }}><Table size="small">
      <TableHead><TableRow><TableCell>Name</TableCell><TableCell>Prefix Template</TableCell><TableCell>Reset Policy</TableCell><TableCell>Default</TableCell><TableCell>Active</TableCell><TableCell align="right">Actions</TableCell></TableRow></TableHead>
      <TableBody>{series.map((item) => <TableRow key={item.id} hover sx={{ opacity: item.active ? 1 : 0.6 }}>
        <TableCell sx={{ fontWeight: 600 }}>{item.name}</TableCell><TableCell sx={{ fontFamily: "monospace" }}>{item.prefixTemplate}</TableCell><TableCell>{item.resetPolicy}</TableCell>
        <TableCell>{item.isDefault ? "Yes" : "No"}</TableCell><TableCell><Chip size="small" color={item.active ? "success" : "default"} label={item.active ? "Active" : "Inactive"} /></TableCell>
        <TableCell align="right"><IconButton size="small" aria-label={`Edit ${item.name}`} onClick={() => edit(item)}><EditOutlined fontSize="small" /></IconButton><IconButton size="small" color="error" aria-label={`Delete ${item.name}`} disabled={item.isDefault} onClick={() => setDeleting(item)}><DeleteOutlined fontSize="small" /></IconButton></TableCell>
      </TableRow>)}{!series.length && <TableRow><TableCell colSpan={6} align="center" sx={{ py: 4 }}><Typography color="text.secondary">No series configured</Typography></TableCell></TableRow>}</TableBody>
    </Table></TableContainer>
    <Box><Button variant="outlined" size="small" startIcon={<Add />} onClick={() => { reset(); setOpen(true); }}>Add Series</Button></Box>
    <Dialog open={open} onClose={close} fullWidth maxWidth="sm"><DialogTitle>{editId ? "Edit Series" : "Add Series"}</DialogTitle><DialogContent dividers><Stack spacing={2} sx={{ pt: 1 }}>
      <TextField label="Name" value={name} onChange={(event) => setName(event.target.value)} placeholder="e.g. Standard Invoices" fullWidth />
      <TextField label="Prefix Template" value={prefixTemplate} onChange={(event) => setPrefixTemplate(event.target.value)} placeholder="e.g. INV-{YYYY}-" helperText={'Use {YYYY} for year, {MM} for month'} fullWidth />
      <TextField select label="Reset Policy" value={resetPolicy} onChange={(event) => setResetPolicy(event.target.value)} fullWidth>{RESET_POLICIES.map((policy) => <MenuItem key={policy} value={policy}>{policy}</MenuItem>)}</TextField>
      <FormControlLabel label="Default" control={<Switch checked={isDefault} onChange={(_, checked) => setIsDefault(checked)} />} />
      <FormControlLabel label="Active" control={<Switch checked={active} onChange={(_, checked) => setActive(checked)} />} />
    </Stack></DialogContent><DialogActions><Button onClick={close}>Cancel</Button><Button variant="contained" disabled={busy || !name || !prefixTemplate} onClick={save}>{busy ? "Saving..." : editId ? "Update" : "Create"}</Button></DialogActions></Dialog>
    <Dialog open={!!deleting} onClose={() => setDeleting(null)}><DialogTitle>Delete series?</DialogTitle><DialogContent><DialogContentText>Delete {deleting?.name}?</DialogContentText></DialogContent><DialogActions><Button onClick={() => setDeleting(null)} disabled={busy}>Cancel</Button><Button color="error" variant="contained" onClick={remove} disabled={busy}>{busy ? "Deleting..." : "Delete"}</Button></DialogActions></Dialog>
  </Stack>;
}
