"use client";

import { useState } from "react";
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, MenuItem, Stack, TextField } from "@mui/material";
import { Plus } from "lucide-react";
import { createConfigValue, type CrmConfigType } from "../_actions/crm-settings";
import { STAGE_KINDS, type StageKind } from "@/lib/crm/stage-kinds";
import { toast } from "sonner";

const KIND_NONE = "__none__";
export function ConfigAddDialog({ configType, label }: { configType: CrmConfigType; label: string }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [stageKind, setStageKind] = useState(KIND_NONE);
  const [loading, setLoading] = useState(false);
  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    try { await createConfigValue(configType, name, configType === "salesStage" ? (stageKind === KIND_NONE ? null : stageKind as StageKind) : undefined); toast.success(`${label} added`); setName(""); setStageKind(KIND_NONE); setOpen(false); }
    catch (error: any) { toast.error(error.message ?? "Failed to add"); }
    finally { setLoading(false); }
  }
  return <><Button size="small" variant="outlined" startIcon={<Plus size={16} />} onClick={() => setOpen(true)}>Add {label}</Button><Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="xs"><DialogTitle>Add {label}</DialogTitle><DialogContent><Stack component="form" id="config-add-form" onSubmit={submit} spacing={2} sx={{ pt: 1 }}><TextField label="Name" value={name} onChange={(event) => setName(event.target.value)} slotProps={{ htmlInput: { maxLength: 100 } }} required fullWidth />{configType === "salesStage" && <TextField select label="Automation trigger" value={stageKind} onChange={(event) => setStageKind(event.target.value)}><MenuItem value={KIND_NONE}>None</MenuItem>{STAGE_KINDS.map((kind) => <MenuItem key={kind} value={kind}>{kind}</MenuItem>)}</TextField>}</Stack></DialogContent><DialogActions><Button onClick={() => setOpen(false)}>Cancel</Button><Button type="submit" form="config-add-form" variant="contained" disabled={loading}>{loading ? "Adding…" : "Add"}</Button></DialogActions></Dialog></>;
}
