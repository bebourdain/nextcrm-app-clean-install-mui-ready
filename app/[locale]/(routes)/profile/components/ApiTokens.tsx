"use client";

import { useEffect, useState } from "react";
import { Alert, Box, Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Typography } from "@mui/material";
import { createApiToken, deleteApiToken, getApiTokens } from "@/actions/api-tokens";

type TokenRow = { id: string; name: string; tokenPrefix: string; createdAt: Date; expiresAt: Date | null; revokedAt: Date | null };
export function ApiTokens() {
  const [tokens, setTokens] = useState<TokenRow[]>([]);
  const [name, setName] = useState("");
  const [expiresAt, setExpiresAt] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newToken, setNewToken] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [revokeId, setRevokeId] = useState<string | null>(null);
  async function load() { const res = await getApiTokens(); if (res.data) setTokens(res.data as TokenRow[]); }
  useEffect(() => { void load(); }, []);
  async function create() {
    if (!name.trim()) return;
    setLoading(true); setError(null);
    try {
      const res = await createApiToken({ name: name.trim(), expiresAt: expiresAt ? new Date(expiresAt) : undefined });
      if (res.error) { setError(res.error); return; }
      setNewToken(res.data!.rawToken); setName(""); setExpiresAt(""); await load();
    } finally { setLoading(false); }
  }
  async function revoke() {
    if (!revokeId) return;
    await deleteApiToken(revokeId);
    setRevokeId(null);
    await load();
  }
  function copy() {
    if (!newToken) return;
    void navigator.clipboard.writeText(newToken);
    setCopied(true); setTimeout(() => setCopied(false), 2000);
  }
  const active = tokens.filter((token) => !token.revokedAt && (!token.expiresAt || new Date(token.expiresAt) > new Date()));
  return <Stack spacing={2}>
    <Typography color="text.secondary" variant="body2">Generate tokens to connect AI agents via MCP. Token prefix: <code>nxtc__</code></Typography>
    <Stack direction={{ xs: "column", sm: "row" }} spacing={1} sx={{ alignItems: { sm: "center" } }}>
      <TextField size="small" label="Token name" placeholder="e.g. Claude Desktop" value={name} onChange={(event) => setName(event.target.value)} sx={{ maxWidth: 320 }} />
      <TextField size="small" label="Optional expiry date" type="date" value={expiresAt} onChange={(event) => setExpiresAt(event.target.value)} slotProps={{ inputLabel: { shrink: true } }} sx={{ maxWidth: 190 }} />
      <Button variant="contained" onClick={create} disabled={loading || !name.trim()}>{loading ? "Generating…" : "Generate"}</Button>
    </Stack>
    {error && <Alert severity="error">{error}</Alert>}
    {active.length > 0 && <TableContainer sx={{ border: 1, borderColor: "divider", borderRadius: 1 }}><Table size="small">
      <TableHead><TableRow><TableCell>Name</TableCell><TableCell>Prefix</TableCell><TableCell>Created</TableCell><TableCell>Expires</TableCell><TableCell align="right">Actions</TableCell></TableRow></TableHead>
      <TableBody>{active.map((token) => <TableRow key={token.id}>
        <TableCell>{token.name}</TableCell><TableCell sx={{ fontFamily: "monospace" }}>nxtc__{token.tokenPrefix}…</TableCell>
        <TableCell>{new Date(token.createdAt).toLocaleDateString()}</TableCell>
        <TableCell>{token.expiresAt ? new Date(token.expiresAt).toLocaleDateString() : "Never"}</TableCell>
        <TableCell align="right"><Button color="error" size="small" onClick={() => setRevokeId(token.id)}>Revoke</Button></TableCell>
      </TableRow>)}</TableBody>
    </Table></TableContainer>}
    <Dialog open={!!newToken} onClose={() => setNewToken(null)} fullWidth maxWidth="sm"><DialogTitle>Token Created</DialogTitle><DialogContent><DialogContentText sx={{ mb: 2 }}>Copy this token now. It will not be shown again.</DialogContentText><Box component="code" sx={{ display: "block", overflowWrap: "anywhere", bgcolor: "action.hover", p: 2, borderRadius: 1 }}>{newToken}</Box></DialogContent><DialogActions><Button onClick={() => setNewToken(null)}>Close</Button><Button variant="contained" onClick={copy}>{copied ? "Copied!" : "Copy to clipboard"}</Button></DialogActions></Dialog>
    <Dialog open={!!revokeId} onClose={() => setRevokeId(null)}><DialogTitle>Revoke token?</DialogTitle><DialogContent><DialogContentText>This cannot be undone.</DialogContentText></DialogContent><DialogActions><Button onClick={() => setRevokeId(null)}>Cancel</Button><Button color="error" variant="contained" onClick={() => void revoke()}>Revoke</Button></DialogActions></Dialog>
  </Stack>;
}
