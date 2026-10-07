"use client";
import { useState } from "react";
import { Alert, Box, Button, Checkbox, List, ListItemButton, ListItemText, Paper, Stack, TextField, Typography } from "@mui/material";

type TargetList = { id: string; name: string; _count: { targets: number } };
type Props = { initialData: { target_list_ids?: string[] }; targetLists: TargetList[]; onNext: (data: { target_list_ids: string[] }) => void; onBack: () => void };

export function Step3Audience({ initialData, targetLists, onNext, onBack }: Props) {
  const [selected, setSelected] = useState<Set<string>>(new Set(initialData.target_list_ids ?? []));
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  const filtered = targetLists.filter((item) => item.name.toLowerCase().includes(search.toLowerCase()));
  const totalRecipients = targetLists.filter((item) => selected.has(item.id)).reduce((sum, item) => sum + item._count.targets, 0);
  const toggle = (id: string) => {
    setSelected((previous) => { const next = new Set(previous); if (next.has(id)) next.delete(id); else next.add(id); return next; });
    setError("");
  };
  const handleNext = () => {
    if (!selected.size) { setError("Select at least one target list"); return; }
    onNext({ target_list_ids: Array.from(selected) });
  };
  return <Stack spacing={2.5} sx={{ maxWidth: 600 }}>
    <TextField size="small" label="Search target lists" value={search} onChange={(event) => setSearch(event.target.value)} />
    <Paper variant="outlined" sx={{ maxHeight: 300, overflow: "auto" }}><List dense disablePadding>
      {filtered.map((item) => <ListItemButton key={item.id} onClick={() => toggle(item.id)}>
        <Checkbox size="small" checked={selected.has(item.id)} tabIndex={-1} />
        <ListItemText primary={item.name} secondary={`${item._count.targets} targets`} />
      </ListItemButton>)}
      {!filtered.length && <Box sx={{ p: 2 }}><Typography variant="body2" color="text.secondary">No target lists found.</Typography></Box>}
    </List></Paper>
    {selected.size > 0 && <Typography variant="body2" color="text.secondary">~{totalRecipients} recipients selected across {selected.size} list(s)</Typography>}
    {error && <Alert severity="error">{error}</Alert>}
    <Stack direction="row" sx={{ justifyContent: "space-between" }}><Button variant="outlined" onClick={onBack}>← Back</Button><Button variant="contained" onClick={handleNext}>Next →</Button></Stack>
  </Stack>;
}
