"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Box, Button, Checkbox, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, List, ListItemButton, ListItemText, Stack, TextField, Typography } from "@mui/material";
import { getTargets } from "@/actions/crm/get-targets";
import { addTargetsToList } from "@/actions/crm/target-lists/add-targets-to-list";

interface Target { id: string; first_name: string | null; last_name: string; email: string | null; company: string | null }
interface AddTargetToListModalProps { targetListId: string; existingTargetIds: string[]; open: boolean; onOpenChange: (open: boolean) => void }

const AddTargetToListModal = ({ targetListId, existingTargetIds, open, onOpenChange }: AddTargetToListModalProps) => {
  const router = useRouter();
  const [targets, setTargets] = useState<Target[]>([]);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [fetchDone, setFetchDone] = useState(false);
  const isFetching = open && !fetchDone;

  useEffect(() => {
    if (!open) return;
    getTargets().then((all) => setTargets(all.filter((target) => !existingTargetIds.includes(target.id))))
      .catch(() => toast.error("Failed to load targets"))
      .finally(() => setFetchDone(true));
  }, [open, existingTargetIds]);

  const handleClose = () => { setFetchDone(false); onOpenChange(false); };

  const filtered = targets.filter((target) => {
    const query = search.toLowerCase();
    return target.first_name?.toLowerCase().includes(query) || target.last_name?.toLowerCase().includes(query) || target.email?.toLowerCase().includes(query) || target.company?.toLowerCase().includes(query);
  });
  const toggle = (id: string) => setSelected((previous) => previous.includes(id) ? previous.filter((item) => item !== id) : [...previous, id]);
  const allFilteredSelected = filtered.length > 0 && filtered.every((target) => selected.includes(target.id));
  const someFilteredSelected = filtered.some((target) => selected.includes(target.id));
  const toggleAll = () => {
    if (allFilteredSelected) setSelected((previous) => previous.filter((id) => !filtered.some((target) => target.id === id)));
    else setSelected((previous) => Array.from(new Set([...previous, ...filtered.map((target) => target.id)])));
  };
  const handleSubmit = async () => {
    if (!selected.length) return;
    setIsLoading(true);
    const result = await addTargetsToList(targetListId, selected);
    setIsLoading(false);
    if (result.error) { toast.error(result.error); return; }
    toast.success(`Added ${selected.length} target(s) to the list`);
    setSelected([]); setSearch(""); handleClose(); router.refresh();
  };

  return <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
    <DialogTitle>Add Targets to List</DialogTitle>
    <DialogContent dividers>
      <DialogContentText sx={{ mb: 2 }}>Select targets to add to this list. Already-added targets are not shown.</DialogContentText>
      <Stack spacing={1.5}>
        <TextField size="small" placeholder="Search by name, email or company..." value={search} onChange={(event) => setSearch(event.target.value)} disabled={isFetching} />
        {!isFetching && filtered.length > 0 && <ListItemButton onClick={toggleAll} sx={{ borderRadius: 1 }}>
          <Checkbox size="small" checked={allFilteredSelected} indeterminate={!allFilteredSelected && someFilteredSelected} tabIndex={-1} />
          <ListItemText primary={`Select all (${filtered.length})`} slotProps={{ primary: { variant: "body2", sx: { fontWeight: 600 } } }} />
        </ListItemButton>}
        <Box sx={{ height: 288, overflowY: "auto", border: 1, borderColor: "divider", borderRadius: 1 }}>
          {isFetching ? <Typography variant="body2" color="text.secondary" sx={{ p: 2 }}>Loading targets...</Typography> :
            !filtered.length ? <Typography variant="body2" color="text.secondary" sx={{ p: 2 }}>No targets available.</Typography> :
            <List dense disablePadding>{filtered.map((target) => <ListItemButton key={target.id} onClick={() => toggle(target.id)}>
              <Checkbox size="small" checked={selected.includes(target.id)} tabIndex={-1} />
              <ListItemText primary={`${target.first_name ?? ""} ${target.last_name}`.trim()} secondary={target.email || target.company || "No contact info"} />
              {target.company && <Typography variant="caption" color="text.secondary" sx={{ ml: 1, flexShrink: 0 }}>{target.company}</Typography>}
            </ListItemButton>)}</List>}
        </Box>
        {selected.length > 0 && <Typography variant="caption" color="text.secondary">{selected.length} target(s) selected</Typography>}
      </Stack>
    </DialogContent>
    <DialogActions><Button onClick={handleClose} disabled={isLoading}>Cancel</Button><Button variant="contained" onClick={handleSubmit} disabled={isLoading || !selected.length}>{isLoading ? "Adding..." : `Add Selected (${selected.length})`}</Button></DialogActions>
  </Dialog>;
};

export default AddTargetToListModal;
