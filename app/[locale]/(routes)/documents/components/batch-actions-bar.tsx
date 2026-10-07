"use client";

import { useState } from "react";
import { Table } from "@tanstack/react-table";
import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, MenuItem, Paper, Select, Stack, Typography } from "@mui/material";
import { DocumentSystemType } from "@prisma/client";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { bulkDeleteDocuments } from "@/actions/documents/bulk-delete-documents";
import { bulkChangeType } from "@/actions/documents/bulk-change-type";
import { bulkLinkToAccount } from "@/actions/documents/bulk-link-to-account";
import { DocumentRow } from "../data/schema";

export function BatchActionsBar({ table, accounts }: { table: Table<DocumentRow>; accounts: { id: string; name: string }[] }) {
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const selectedIds = table.getFilteredSelectedRowModel().rows.map((row) => row.original.id);
  const count = selectedIds.length;
  if (count === 0) return null;
  async function handleDelete() {
    setLoading(true);
    try { await bulkDeleteDocuments(selectedIds); table.toggleAllRowsSelected(false); toast.success(`${count} document(s) deleted`); router.refresh(); }
    catch { toast.error("Failed to delete documents"); }
    finally { setLoading(false); setDeleteOpen(false); }
  }
  async function handleChangeType(type: string) {
    try { await bulkChangeType(selectedIds, type as DocumentSystemType); toast.success(`Type updated for ${count} document(s)`); router.refresh(); }
    catch { toast.error("Failed to update type"); }
  }
  async function handleLinkAccount(accountId: string) {
    try { await bulkLinkToAccount(selectedIds, accountId); toast.success(`${count} document(s) linked to account`); router.refresh(); }
    catch { toast.error("Failed to link documents"); }
  }
  return <><Paper variant="outlined" sx={{ px: 2, py: 1.5, bgcolor: "action.hover" }}><Stack direction="row" spacing={1.5} sx={{ alignItems: "center", flexWrap: "wrap", gap: 1 }}><Typography variant="body2" sx={{ fontWeight: 600 }}>{count} selected</Typography><Select size="small" value="" displayEmpty renderValue={() => <Typography variant="body2" color="text.secondary">Link to Account</Typography>} onChange={(event) => handleLinkAccount(event.target.value)} sx={{ minWidth: 160 }} aria-label="Link to Account">{accounts.map((account) => <MenuItem key={account.id} value={account.id}>{account.name}</MenuItem>)}</Select><Select size="small" value="" displayEmpty renderValue={() => <Typography variant="body2" color="text.secondary">Change Type</Typography>} onChange={(event) => handleChangeType(event.target.value)} sx={{ minWidth: 140 }} aria-label="Change Type">{[["RECEIPT", "Receipt"], ["CONTRACT", "Contract"], ["OFFER", "Offer"], ["OTHER", "Other"]].map(([value, label]) => <MenuItem key={value} value={value}>{label}</MenuItem>)}</Select><Button color="error" variant="outlined" size="small" onClick={() => setDeleteOpen(true)}>Delete</Button></Stack></Paper><Dialog open={deleteOpen} onClose={() => setDeleteOpen(false)}><DialogTitle>Delete selected documents?</DialogTitle><DialogContent><DialogContentText>{count} document(s) will be deleted.</DialogContentText></DialogContent><DialogActions><Button onClick={() => setDeleteOpen(false)}>Cancel</Button><Button color="error" variant="contained" onClick={handleDelete} disabled={loading}>{loading ? "Deleting…" : "Delete"}</Button></DialogActions></Dialog></>;
}
