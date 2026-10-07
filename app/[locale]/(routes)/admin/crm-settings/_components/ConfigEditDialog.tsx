"use client";

import { useState } from "react";
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, MenuItem, Stack, TextField } from "@mui/material";
import { updateConfigValue, type CrmConfigType } from "../_actions/crm-settings";
import { STAGE_KINDS, type StageKind } from "@/lib/crm/stage-kinds";
import { toast } from "sonner";

const KIND_NONE = "__none__";
type Props = { configType: CrmConfigType; id: string; currentName: string; currentStageKind?: string | null; open: boolean; onOpenChange: (value: boolean) => void };
export function ConfigEditDialog({ configType, id, currentName, currentStageKind, open, onOpenChange }: Props) {
  const [name, setName] = useState(currentName);
  const [stageKind, setStageKind] = useState(currentStageKind ?? KIND_NONE);
  const [loading, setLoading] = useState(false);
  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    try { await updateConfigValue(configType, id, name, configType === "salesStage" ? (stageKind === KIND_NONE ? null : stageKind as StageKind) : undefined); toast.success("Updated"); onOpenChange(false); }
    catch (error: any) { toast.error(error.message ?? "Failed to update"); }
    finally { setLoading(false); }
  }
  return <Dialog open={open} onClose={() => onOpenChange(false)} fullWidth maxWidth="xs"><DialogTitle>Edit Value</DialogTitle><DialogContent><Stack component="form" id="config-edit-form" onSubmit={submit} spacing={2} sx={{ pt: 1 }}><TextField label="Name" value={name} onChange={(event) => setName(event.target.value)} slotProps={{ htmlInput: { maxLength: 100 } }} required fullWidth />{configType === "salesStage" && <TextField select label="Automation trigger" value={stageKind} onChange={(event) => setStageKind(event.target.value)}><MenuItem value={KIND_NONE}>None</MenuItem>{STAGE_KINDS.map((kind) => <MenuItem key={kind} value={kind}>{kind}</MenuItem>)}</TextField>}</Stack></DialogContent><DialogActions><Button onClick={() => onOpenChange(false)}>Cancel</Button><Button type="submit" form="config-edit-form" variant="contained" disabled={loading}>{loading ? "Saving…" : "Save"}</Button></DialogActions></Dialog>;
}
