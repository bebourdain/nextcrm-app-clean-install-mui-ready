"use client";

import { useState } from "react";
import { Button, Chip, Paper, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField } from "@mui/material";
import { toast } from "sonner";
import { updateExchangeRate } from "../_actions/currencies";
import type { ExchangeRateValue } from "../_actions/currencies";

export function ExchangeRatesTable({ rates, ecbEnabled }: { rates: ExchangeRateValue[]; ecbEnabled: boolean }) {
  const [editing, setEditing] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  async function save(rate: ExchangeRateValue) {
    try { await updateExchangeRate({ fromCurrency: rate.fromCurrency, toCurrency: rate.toCurrency, rate: editValue }); toast.success("Rate updated"); setEditing(null); }
    catch { toast.error("Failed to update rate"); }
  }
  return <TableContainer component={Paper} variant="outlined"><Table size="small"><TableHead><TableRow><TableCell>From</TableCell><TableCell>To</TableCell><TableCell>Rate</TableCell><TableCell>Source</TableCell><TableCell>Updated</TableCell><TableCell /></TableRow></TableHead><TableBody>{rates.map((rate) => <TableRow key={rate.id}><TableCell>{rate.fromCurrency}</TableCell><TableCell>{rate.toCurrency}</TableCell><TableCell>{editing === rate.id ? <TextField size="small" value={editValue} onChange={(event) => setEditValue(event.target.value)} autoFocus sx={{ width: 130 }} /> : <code>{rate.rate}</code>}</TableCell><TableCell><Chip size="small" variant="outlined" color={rate.source === "ECB" ? "primary" : "default"} label={rate.source} /></TableCell><TableCell>{new Date(rate.updatedAt).toLocaleDateString()}</TableCell><TableCell>{editing === rate.id ? <Stack direction="row" spacing={1}><Button size="small" variant="contained" onClick={() => save(rate)}>Save</Button><Button size="small" onClick={() => setEditing(null)}>Cancel</Button></Stack> : <Button size="small" onClick={() => { setEditing(rate.id); setEditValue(rate.rate); }} disabled={ecbEnabled && rate.source === "ECB"}>Edit</Button>}</TableCell></TableRow>)}</TableBody></Table></TableContainer>;
}
