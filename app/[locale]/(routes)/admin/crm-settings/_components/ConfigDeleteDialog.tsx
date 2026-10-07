"use client";

import { useState } from "react";
import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, MenuItem, TextField } from "@mui/material";
import { deleteConfigValue, type CrmConfigType, type ConfigValue } from "../_actions/crm-settings";
import { toast } from "sonner";

type Props = { configType: CrmConfigType; item: ConfigValue; allValues: ConfigValue[]; open: boolean; onOpenChange: (value: boolean) => void };
export function ConfigDeleteDialog({ configType, item, allValues, open, onOpenChange }: Props) {
  const others = allValues.filter((value) => value.id !== item.id);
  const [replacementId, setReplacementId] = useState("");
  const [loading, setLoading] = useState(false);
  async function remove() {
    if (item.usageCount > 0 && !replacementId) { toast.error("Select a replacement before deleting"); return; }
    setLoading(true);
    try { await deleteConfigValue(configType, item.id, item.usageCount > 0 ? replacementId : undefined); toast.success("Deleted"); onOpenChange(false); }
    catch (error: any) { toast.error(error.message ?? "Failed to delete"); }
    finally { setLoading(false); }
  }
  return <Dialog open={open} onClose={() => onOpenChange(false)} fullWidth maxWidth="xs"><DialogTitle>Delete &quot;{item.name}&quot;</DialogTitle><DialogContent>{item.usageCount > 0 && <><DialogContentText sx={{ mb: 2 }}>{item.usageCount} record{item.usageCount !== 1 ? "s" : ""} use this value. Choose a replacement before deleting.</DialogContentText><TextField select label="Select replacement" value={replacementId} onChange={(event) => setReplacementId(event.target.value)} fullWidth>{others.map((other) => <MenuItem key={other.id} value={other.id}>{other.name}</MenuItem>)}</TextField></>}</DialogContent><DialogActions><Button onClick={() => onOpenChange(false)}>Cancel</Button><Button color="error" variant="contained" onClick={remove} disabled={loading || (item.usageCount > 0 && !replacementId)}>{loading ? "Deleting…" : item.usageCount > 0 ? "Reassign & Delete" : "Delete"}</Button></DialogActions></Dialog>;
}
