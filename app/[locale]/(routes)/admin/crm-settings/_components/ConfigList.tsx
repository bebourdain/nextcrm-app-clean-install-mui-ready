"use client";

import { useState } from "react";
import { Box, Chip, Divider, IconButton, Paper, Stack, Typography } from "@mui/material";
import { Pencil, Trash2 } from "lucide-react";
import { ConfigEditDialog } from "./ConfigEditDialog";
import { ConfigDeleteDialog } from "./ConfigDeleteDialog";
import { ConfigAddDialog } from "./ConfigAddDialog";
import type { CrmConfigType, ConfigValue } from "../_actions/crm-settings";

export function ConfigList({ configType, label, values }: { configType: CrmConfigType; label: string; values: ConfigValue[] }) {
  const [editItem, setEditItem] = useState<ConfigValue | null>(null);
  const [deleteItem, setDeleteItem] = useState<ConfigValue | null>(null);
  return <Stack spacing={2}><Stack direction="row" sx={{ justifyContent: "space-between", alignItems: "center" }}><Typography variant="body2" color="text.secondary">{values.length} value{values.length !== 1 ? "s" : ""}</Typography><ConfigAddDialog configType={configType} label={label} /></Stack><Paper variant="outlined">{values.length === 0 && <Typography variant="body2" color="text.secondary" sx={{ p: 2 }}>No values yet.</Typography>}{values.map((item, index) => <Box key={item.id}>{index > 0 && <Divider />}<Stack direction="row" spacing={1} sx={{ alignItems: "center", justifyContent: "space-between", px: 2, py: 1 }}><Stack direction="row" spacing={1} sx={{ alignItems: "center", flexWrap: "wrap" }}><Typography variant="body2" sx={{ fontWeight: 600 }}>{item.name}</Typography>{item.usageCount > 0 && <Chip size="small" label={`${item.usageCount} in use`} />}{item.stageKind && <Chip size="small" variant="outlined" label={item.stageKind} />}</Stack><Stack direction="row"><IconButton size="small" aria-label={`Edit ${item.name}`} onClick={() => setEditItem(item)}><Pencil size={17} /></IconButton><IconButton size="small" color="error" aria-label={`Delete ${item.name}`} disabled={values.length <= 1} title={values.length <= 1 ? "Cannot delete the last value" : undefined} onClick={() => setDeleteItem(item)}><Trash2 size={17} /></IconButton></Stack></Stack></Box>)}</Paper>{editItem && <ConfigEditDialog configType={configType} id={editItem.id} currentName={editItem.name} currentStageKind={editItem.stageKind ?? null} open={!!editItem} onOpenChange={(value) => { if (!value) setEditItem(null); }} />}{deleteItem && <ConfigDeleteDialog configType={configType} item={deleteItem} allValues={values} open={!!deleteItem} onOpenChange={(value) => { if (!value) setDeleteItem(null); }} />}</Stack>;
}
