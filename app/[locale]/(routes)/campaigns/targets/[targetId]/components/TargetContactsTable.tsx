"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Box, Button, Chip, Dialog, DialogContent, DialogTitle, Link, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Typography } from "@mui/material";

interface TargetContact {
  id: string; name: string | null; email: string | null; title: string | null; phone: string | null;
  linkedinUrl: string | null; source: string; enrichStatus: string;
}
const statusColor = (status: string): "default" | "info" | "success" | "error" => {
  if (status === "COMPLETED") return "success";
  if (status === "RUNNING") return "info";
  if (status === "FAILED") return "error";
  return "default";
};
const statusLabel: Record<string, string> = { COMPLETED: "Enriched", RUNNING: "Running", PENDING: "Pending", FAILED: "Failed", SKIPPED: "Skipped" };

export function TargetContactsTable({ targetId, contacts: initialContacts }: { targetId: string; contacts: TargetContact[] }) {
  const [contacts, setContacts] = useState(initialContacts);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", phone: "", linkedinUrl: "" });
  const [saving, setSaving] = useState(false);
  async function handleAddContact(event: React.FormEvent) {
    event.preventDefault(); setSaving(true);
    try {
      const res = await fetch(`/api/crm/targets/${targetId}/contacts`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      if (!res.ok) throw new Error(await res.text());
      const created: TargetContact = await res.json();
      setContacts((previous) => [...previous, created]); setOpen(false); setForm({ name: "", email: "", phone: "", linkedinUrl: "" });
      toast.success("Contact added");
    } catch (error) { toast.error(error instanceof Error ? error.message : "Failed to add contact"); }
    finally { setSaving(false); }
  }
  async function handleEnrichContact(contactId: string) {
    try {
      const res = await fetch(`/api/crm/targets/${targetId}/contacts/${contactId}/enrich`, { method: "POST" });
      if (!res.ok) throw new Error(await res.text());
      setContacts((previous) => previous.map((contact) => contact.id === contactId ? { ...contact, enrichStatus: "RUNNING" } : contact));
      toast.success("Enrichment started — you'll be notified when done");
    } catch { toast.error("Failed to start enrichment"); }
  }
  return <Stack spacing={2}>
    <Box sx={{ display: "flex", justifyContent: "flex-end" }}><Button variant="outlined" size="small" onClick={() => setOpen(true)}>Add Contact</Button></Box>
    {!contacts.length ? <Typography variant="body2" color="text.secondary">No contacts yet. Run enrichment to discover C-level contacts, or add one manually.</Typography> :
      <TableContainer sx={{ border: 1, borderColor: "divider", borderRadius: "var(--radius)" }}><Table size="small">
        <TableHead><TableRow>{["Name", "Title", "Email", "Phone", "LinkedIn", "Status", ""].map((label, index) => <TableCell key={`${label}-${index}`} sx={{ color: "text.secondary" }}>{label}</TableCell>)}</TableRow></TableHead>
        <TableBody>{contacts.map((contact) => <TableRow key={contact.id} hover>
          <TableCell sx={{ fontWeight: 600 }}>{contact.name ?? "—"}</TableCell><TableCell>{contact.title ?? "—"}</TableCell>
          <TableCell>{contact.email ?? "—"}</TableCell><TableCell>{contact.phone ?? "—"}</TableCell>
          <TableCell>{contact.linkedinUrl ? <Link href={contact.linkedinUrl} target="_blank" rel="noopener noreferrer">View</Link> : "—"}</TableCell>
          <TableCell><Chip size="small" color={statusColor(contact.enrichStatus)} label={statusLabel[contact.enrichStatus] ?? "Pending"} /></TableCell>
          <TableCell>{(contact.enrichStatus === "PENDING" || contact.enrichStatus === "FAILED") && <Button size="small" onClick={() => handleEnrichContact(contact.id)}>Enrich</Button>}</TableCell>
        </TableRow>)}</TableBody>
      </Table></TableContainer>}
    <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm">
      <DialogTitle>Add Contact</DialogTitle><DialogContent dividers>
        <Stack component="form" onSubmit={handleAddContact} spacing={2} sx={{ pt: 1 }}>
          <TextField label="Name" value={form.name} onChange={(event) => setForm((previous) => ({ ...previous, name: event.target.value }))} placeholder="Jane Smith" />
          <TextField label="Email" type="email" value={form.email} onChange={(event) => setForm((previous) => ({ ...previous, email: event.target.value }))} placeholder="jane@acme.com" />
          <TextField label="Phone" value={form.phone} onChange={(event) => setForm((previous) => ({ ...previous, phone: event.target.value }))} placeholder="+1 415 000 0000" />
          <TextField label="LinkedIn URL" value={form.linkedinUrl} onChange={(event) => setForm((previous) => ({ ...previous, linkedinUrl: event.target.value }))} placeholder="https://linkedin.com/in/..." />
          <Button variant="contained" type="submit" disabled={saving}>{saving ? "Adding…" : "Add Contact"}</Button>
        </Stack>
      </DialogContent>
    </Dialog>
  </Stack>;
}
