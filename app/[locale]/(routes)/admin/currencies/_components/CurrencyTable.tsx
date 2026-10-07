"use client";

import { useState } from "react";
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Paper, Radio, Stack, Switch, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField } from "@mui/material";
import { toast } from "sonner";
import { toggleCurrency, setDefaultCurrency, createCurrency } from "../_actions/currencies";
import type { CurrencyValue } from "../_actions/currencies";

export function CurrencyTable({ currencies }: { currencies: CurrencyValue[] }) {
  const [adding, setAdding] = useState(false);
  const [newCode, setNewCode] = useState("");
  const [newName, setNewName] = useState("");
  const [newSymbol, setNewSymbol] = useState("");
  async function handleToggle(code: string, enabled: boolean) {
    try { await toggleCurrency(code, enabled); toast.success(`Currency ${code} ${enabled ? "enabled" : "disabled"}`); }
    catch { toast.error("Failed to update currency"); }
  }
  async function handleSetDefault(code: string) {
    try { await setDefaultCurrency(code); toast.success(`${code} set as default currency`); }
    catch { toast.error("Failed to set default currency"); }
  }
  async function handleCreate() {
    try { await createCurrency({ code: newCode, name: newName, symbol: newSymbol }); toast.success(`Currency ${newCode} added`); setAdding(false); setNewCode(""); setNewName(""); setNewSymbol(""); }
    catch (error: any) { toast.error(error.message || "Failed to add currency"); }
  }
  return <Stack spacing={2}><TableContainer component={Paper} variant="outlined"><Table size="small"><TableHead><TableRow><TableCell>Code</TableCell><TableCell>Name</TableCell><TableCell>Symbol</TableCell><TableCell>Enabled</TableCell><TableCell>Default</TableCell></TableRow></TableHead><TableBody>{currencies.map((currency) => <TableRow key={currency.code} sx={{ opacity: currency.isEnabled ? 1 : 0.5 }}><TableCell sx={{ fontWeight: 600 }}>{currency.code}</TableCell><TableCell>{currency.name}</TableCell><TableCell>{currency.symbol}</TableCell><TableCell><Switch checked={currency.isEnabled} onChange={(event) => handleToggle(currency.code, event.target.checked)} disabled={currency.isDefault} slotProps={{ input: { "aria-label": `Enable ${currency.code}` } }} /></TableCell><TableCell><Radio name="defaultCurrency" checked={currency.isDefault} onChange={() => handleSetDefault(currency.code)} slotProps={{ input: { "aria-label": `Set ${currency.code} as default` } }} /></TableCell></TableRow>)}</TableBody></Table></TableContainer><Button size="small" variant="outlined" onClick={() => setAdding(true)} sx={{ alignSelf: "flex-start" }}>+ Add Currency</Button><Dialog open={adding} onClose={() => setAdding(false)} fullWidth maxWidth="xs"><DialogTitle>Add Currency</DialogTitle><DialogContent><Stack spacing={2} sx={{ pt: 1 }}><TextField label="Code (e.g. GBP)" value={newCode} onChange={(event) => setNewCode(event.target.value.toUpperCase())} slotProps={{ htmlInput: { maxLength: 3 } }} /><TextField label="Name (e.g. British Pound)" value={newName} onChange={(event) => setNewName(event.target.value)} /><TextField label="Symbol (e.g. £)" value={newSymbol} onChange={(event) => setNewSymbol(event.target.value)} slotProps={{ htmlInput: { maxLength: 5 } }} /></Stack></DialogContent><DialogActions><Button onClick={() => setAdding(false)}>Cancel</Button><Button variant="contained" onClick={handleCreate} disabled={!newCode || !newName || !newSymbol}>Add</Button></DialogActions></Dialog></Stack>;
}
