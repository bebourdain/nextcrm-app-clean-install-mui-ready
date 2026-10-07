"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Add, DeleteOutlined, EditOutlined } from "@mui/icons-material";
import { Box, Button, Chip, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, FormControlLabel, IconButton, Stack, Switch, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Typography } from "@mui/material";
import { toast } from "sonner";

interface TaxRate { id: string; name: string; rate: string; isDefault: boolean; active: boolean }

export function TaxRatesTable({ rates }: { rates: TaxRate[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [rate, setRate] = useState("");
  const [isDefault, setIsDefault] = useState(false);
  const [active, setActive] = useState(true);
  const [deleting, setDeleting] = useState<TaxRate | null>(null);
  const [busy, setBusy] = useState(false);

  const reset = () => { setEditId(null); setName(""); setRate(""); setIsDefault(false); setActive(true); };
  const edit = (item: TaxRate) => { setEditId(item.id); setName(item.name); setRate(item.rate); setIsDefault(item.isDefault); setActive(item.active); setOpen(true); };
  const close = () => { setOpen(false); reset(); };
  const save = async () => {
    setBusy(true);
    try {
      const response = await fetch(editId ? `/api/admin/invoices/tax-rates/${editId}` : "/api/admin/invoices/tax-rates", { method: editId ? "PATCH" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name, rate: parseFloat(rate), isDefault, active }) });
      if (!response.ok) throw new Error(await response.text());
      toast.success(editId ? "Tax rate updated" : "Tax rate created"); close(); router.refresh();
    } catch { toast.error("Failed to save tax rate"); }
    finally { setBusy(false); }
  };
  const remove = async () => {
    if (!deleting) return;
    setBusy(true);
    try {
      const response = await fetch(`/api/admin/invoices/tax-rates/${deleting.id}`, { method: "DELETE" });
      if (!response.ok) throw new Error(await response.text());
      toast.success("Tax rate deleted"); setDeleting(null); router.refresh();
    } catch { toast.error("Failed to delete tax rate"); }
    finally { setBusy(false); }
  };

  return <Stack spacing={2}>
    <TableContainer sx={{ border: 1, borderColor: "divider", borderRadius: 1 }}><Table size="small">
      <TableHead><TableRow><TableCell>Name</TableCell><TableCell>Rate %</TableCell><TableCell>Default</TableCell><TableCell>Active</TableCell><TableCell align="right">Actions</TableCell></TableRow></TableHead>
      <TableBody>{rates.map((item) => <TableRow key={item.id} hover sx={{ opacity: item.active ? 1 : 0.6 }}>
        <TableCell sx={{ fontWeight: 600 }}>{item.name}</TableCell><TableCell>{item.rate}%</TableCell><TableCell>{item.isDefault ? "Yes" : "No"}</TableCell><TableCell><Chip size="small" color={item.active ? "success" : "default"} label={item.active ? "Active" : "Inactive"} /></TableCell>
        <TableCell align="right"><IconButton size="small" aria-label={`Edit ${item.name}`} onClick={() => edit(item)}><EditOutlined fontSize="small" /></IconButton><IconButton size="small" color="error" aria-label={`Delete ${item.name}`} disabled={item.isDefault} onClick={() => setDeleting(item)}><DeleteOutlined fontSize="small" /></IconButton></TableCell>
      </TableRow>)}{!rates.length && <TableRow><TableCell colSpan={5} align="center" sx={{ py: 4 }}><Typography color="text.secondary">No tax rates configured</Typography></TableCell></TableRow>}</TableBody>
    </Table></TableContainer>
    <Box><Button variant="outlined" size="small" startIcon={<Add />} onClick={() => { reset(); setOpen(true); }}>Add Tax Rate</Button></Box>
    <Dialog open={open} onClose={close} fullWidth maxWidth="sm"><DialogTitle>{editId ? "Edit Tax Rate" : "Add Tax Rate"}</DialogTitle><DialogContent dividers><Stack spacing={2} sx={{ pt: 1 }}>
      <TextField label="Name" value={name} onChange={(event) => setName(event.target.value)} placeholder="e.g. Standard VAT" fullWidth />
      <TextField label="Rate %" type="number" slotProps={{ htmlInput: { step: "0.01" } }} value={rate} onChange={(event) => setRate(event.target.value)} placeholder="e.g. 21" fullWidth />
      <FormControlLabel label="Default" control={<Switch checked={isDefault} onChange={(_, checked) => setIsDefault(checked)} />} />
      <FormControlLabel label="Active" control={<Switch checked={active} onChange={(_, checked) => setActive(checked)} />} />
    </Stack></DialogContent><DialogActions><Button onClick={close}>Cancel</Button><Button variant="contained" disabled={busy || !name || !rate} onClick={save}>{busy ? "Saving..." : editId ? "Update" : "Create"}</Button></DialogActions></Dialog>
    <Dialog open={!!deleting} onClose={() => setDeleting(null)}><DialogTitle>Delete tax rate?</DialogTitle><DialogContent><DialogContentText>Delete {deleting?.name}?</DialogContentText></DialogContent><DialogActions><Button onClick={() => setDeleting(null)} disabled={busy}>Cancel</Button><Button color="error" variant="contained" onClick={remove} disabled={busy}>{busy ? "Deleting..." : "Delete"}</Button></DialogActions></Dialog>
  </Stack>;
}
