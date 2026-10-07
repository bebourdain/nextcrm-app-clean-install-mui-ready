"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Alert, Box, Button, Chip, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, FormControlLabel, MenuItem, Paper, Stack, Switch, TextField, Typography } from "@mui/material";
import { Refresh } from "@mui/icons-material";
import { createEmailAccount, deleteEmailAccount, setEmailAccountActive, testEmailConnection, listImapFolders } from "@/actions/emails/accounts";
import type { getEmailAccounts } from "@/actions/emails/accounts";
import { triggerSync } from "@/actions/emails/sync";

type Account = Awaited<ReturnType<typeof getEmailAccounts>>[number];
type Form = { label: string; imapHost: string; imapPort: string; imapSsl: boolean; smtpHost: string; smtpPort: string; smtpSsl: boolean; allowSelfSignedTls: boolean; username: string; password: string; sentFolderName: string };

export function EmailAccountsList({ accounts }: { accounts: Account[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [testing, setTesting] = useState(false);
  const [syncingId, setSyncingId] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState<Form>({
    label: "", imapHost: "", imapPort: "993", imapSsl: true, smtpHost: "", smtpPort: "465",
    smtpSsl: true, allowSelfSignedTls: false, username: "", password: "", sentFolderName: "Sent",
  });
  const [provider, setProvider] = useState<"gmail" | "generic">("generic");
  const [discovering, setDiscovering] = useState(false);
  const [folders, setFolders] = useState<string[]>([]);
  const [discoverError, setDiscoverError] = useState<string | null>(null);
  const refresh = () => router.refresh();
  const setField = (key: keyof Form, value: string | boolean) => setForm((previous) => ({ ...previous, [key]: value }));
  const close = () => { setOpen(false); setProvider("generic"); setFolders([]); setDiscoverError(null); };
  function applyGmailPreset() {
    setProvider("gmail");
    setForm((previous) => ({ ...previous, label: previous.label || "Gmail", imapHost: "imap.gmail.com", imapPort: "993", imapSsl: true, smtpHost: "smtp.gmail.com", smtpPort: "465", smtpSsl: true, sentFolderName: "[Gmail]/Sent Mail" }));
  }
  function applyGenericPreset() {
    setProvider("generic"); setFolders([]); setDiscoverError(null);
    setForm((previous) => ({ ...previous, label: previous.label === "Gmail" ? "" : previous.label, imapHost: previous.imapHost === "imap.gmail.com" ? "" : previous.imapHost, smtpHost: previous.smtpHost === "smtp.gmail.com" ? "" : previous.smtpHost, sentFolderName: previous.sentFolderName === "[Gmail]/Sent Mail" ? "Sent" : previous.sentFolderName }));
  }
  async function discover() {
    setDiscovering(true); setDiscoverError(null); setFolders([]);
    const result = await listImapFolders({ imapHost: form.imapHost, imapPort: Number(form.imapPort), imapSsl: form.imapSsl, allowSelfSignedTls: form.allowSelfSignedTls, username: form.username, password: form.password });
    setDiscovering(false);
    if (!result.ok) { setDiscoverError(result.error ?? "Failed to list folders"); return; }
    setFolders(result.folders);
  }
  async function test() {
    setTesting(true); setTestResult(null);
    const result = await testEmailConnection({ imapHost: form.imapHost, imapPort: Number(form.imapPort), imapSsl: form.imapSsl, allowSelfSignedTls: form.allowSelfSignedTls, username: form.username, password: form.password });
    setTesting(false);
    setTestResult(result.ok ? "✓ Connection successful" : `✗ ${result.error}`);
  }
  async function create() {
    await createEmailAccount({ ...form, imapPort: Number(form.imapPort), smtpPort: Number(form.smtpPort) });
    close(); refresh();
  }
  async function remove() {
    if (!deleteId) return;
    await deleteEmailAccount(deleteId);
    setDeleteId(null); refresh();
  }
  async function toggle(id: string, current: boolean) { await setEmailAccountActive(id, !current); refresh(); }
  async function sync(id: string) {
    setSyncingId(id);
    try { await triggerSync(id); refresh(); }
    finally { setSyncingId(null); }
  }
  const input = (key: keyof Form, label: string, type = "text") => <TextField key={key} label={label} type={type} size="small" value={form[key]} onChange={(event) => setField(key, event.target.value)} fullWidth />;

  return <Stack spacing={2}>
    {!accounts.length && <Typography color="text.secondary">No email accounts connected.</Typography>}
    {accounts.map((account) => <Paper key={account.id} variant="outlined" sx={{ p: 2 }}>
      <Stack direction={{ xs: "column", md: "row" }} spacing={2} sx={{ justifyContent: "space-between", alignItems: { md: "center" } }}>
        <Box><Typography sx={{ fontWeight: 600 }}>{account.label}</Typography><Typography variant="body2" color="text.secondary">{account.username} @ {account.imapHost}</Typography>
          {account.lastSyncedAt && <Typography variant="caption" color="text.secondary">Last synced: {new Date(account.lastSyncedAt).toLocaleString()}</Typography>}
        </Box>
        <Stack direction="row" spacing={1} sx={{ alignItems: "center", flexWrap: "wrap", gap: 1 }}>
          <Chip clickable size="small" color={account.isActive ? "success" : "default"} label={account.isActive ? "Active" : "Inactive"} onClick={() => void toggle(account.id, account.isActive)} />
          <Button size="small" startIcon={<Refresh />} disabled={syncingId === account.id} onClick={() => void sync(account.id)}>{syncingId === account.id ? "Syncing…" : "Sync"}</Button>
          <Button size="small" color="error" onClick={() => setDeleteId(account.id)}>Delete</Button>
        </Stack>
      </Stack>
    </Paper>)}
    <Box><Button size="small" variant="outlined" onClick={() => setOpen(true)}>Add Email Account</Button></Box>
    <Dialog open={open} onClose={close} fullWidth maxWidth="sm" scroll="paper">
      <DialogTitle>{provider === "gmail" ? "Connect Gmail Account" : "Connect IMAP Account"}</DialogTitle>
      <DialogContent dividers><Stack spacing={2} sx={{ pt: 1 }}>
        <Stack direction="row" spacing={1}>
          <Button size="small" variant={provider === "gmail" ? "contained" : "outlined"} onClick={applyGmailPreset}>Connect Gmail</Button>
          <Button size="small" variant={provider === "generic" ? "contained" : "outlined"} onClick={applyGenericPreset}>Other IMAP</Button>
        </Stack>
        {input("label", "Label (e.g. Work Gmail)")}
        <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>{input("imapHost", "IMAP Host")}{input("imapPort", "IMAP Port", "number")}</Stack>
        <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>{input("smtpHost", "SMTP Host")}{input("smtpPort", "SMTP Port", "number")}</Stack>
        {input("username", "Username / Email", "email")}
        {provider === "gmail" && <Alert severity="info">Gmail requires a <strong>16-character App Password</strong> — your regular Gmail password won&apos;t work. <a href="https://myaccount.google.com/apppasswords" target="_blank" rel="noopener noreferrer">Create one here</a> (Google Account → Security → App Passwords). Enter it below.</Alert>}
        <TextField label={provider === "gmail" ? "App Password (16 characters)" : "Password"} type="password" size="small" value={form.password} onChange={(event) => setField("password", event.target.value)} placeholder={provider === "gmail" ? "xxxx xxxx xxxx xxxx" : ""} fullWidth />
        <Stack direction="row" spacing={1} sx={{ justifyContent: "space-between", alignItems: "center" }}><Typography variant="body2">Sent Folder Name</Typography><Button size="small" disabled={discovering || !form.imapHost || !form.username || !form.password} onClick={() => void discover()}>{discovering ? "Discovering…" : "Discover folders"}</Button></Stack>
        {folders.length ? <TextField select label="Sent Folder Name" size="small" value={form.sentFolderName} onChange={(event) => setField("sentFolderName", event.target.value)} fullWidth>{folders.map((folder) => <MenuItem key={folder} value={folder}>{folder}</MenuItem>)}</TextField> :
          <TextField label="Sent Folder Name" size="small" value={form.sentFolderName} onChange={(event) => setField("sentFolderName", event.target.value)} placeholder="e.g. Sent or [Gmail]/Sent Mail" fullWidth />}
        {discoverError && <Alert severity="error">{discoverError}</Alert>}
        <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
          <FormControlLabel control={<Switch checked={form.imapSsl} onChange={(_, checked) => setField("imapSsl", checked)} />} label="IMAP SSL" />
          <FormControlLabel control={<Switch checked={form.smtpSsl} onChange={(_, checked) => setField("smtpSsl", checked)} />} label="SMTP SSL" />
        </Stack>
        <FormControlLabel control={<Switch checked={form.allowSelfSignedTls} onChange={(_, checked) => setField("allowSelfSignedTls", checked)} />} label="Allow self-signed TLS certificates" />
        <Typography variant="caption" color="text.secondary">Off by default. Enable only for a mail server you control that uses a self-signed certificate.</Typography>
        {testResult && <Alert severity={testResult.startsWith("✓") ? "success" : "error"}>{testResult}</Alert>}
      </Stack></DialogContent>
      <DialogActions><Button onClick={close}>Cancel</Button><Button variant="outlined" onClick={() => void test()} disabled={testing}>{testing ? "Testing…" : "Test Connection"}</Button><Button variant="contained" onClick={() => void create()}>Save</Button></DialogActions>
    </Dialog>
    <Dialog open={!!deleteId} onClose={() => setDeleteId(null)}><DialogTitle>Delete email account?</DialogTitle><DialogContent><DialogContentText>Delete this email account and all synced emails?</DialogContentText></DialogContent><DialogActions><Button onClick={() => setDeleteId(null)}>Cancel</Button><Button color="error" variant="contained" onClick={() => void remove()}>Delete</Button></DialogActions></Dialog>
  </Stack>;
}
