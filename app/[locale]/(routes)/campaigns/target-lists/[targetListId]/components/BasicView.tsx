"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import moment from "moment";
import { Box, Button, Chip, Divider, Grid, IconButton, Paper, Stack, Typography } from "@mui/material";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { removeTargetFromList } from "@/actions/crm/target-lists/remove-target-from-list";
import AddTargetToListModal from "@/components/modals/AddTargetToListModal";
import ExportTargetsButton from "@/components/campaigns/ExportTargetsButton";

function Field({ label, value }: { label: string; value?: React.ReactNode }) {
  return <Box sx={{ py: 1 }}><Typography variant="body2" sx={{ fontWeight: 600 }}>{label}</Typography><Typography variant="body2" color="text.secondary" component="div">{value || "N/A"}</Typography></Box>;
}
export function BasicView({ data }: { data: any }) {
  const router = useRouter();
  const [addOpen, setAddOpen] = useState(false);
  const [removingId, setRemovingId] = useState<string | null>(null);
  if (!data) return <Typography>Target list not found</Typography>;
  const existingTargetIds: string[] = (data.targets ?? []).map((item: any) => item.target_id);
  const handleRemove = async (targetId: string) => {
    setRemovingId(targetId);
    try {
      const result = await removeTargetFromList(data.id, targetId);
      if (result.error) toast.error(result.error);
      else { toast.success("Target removed from list"); router.refresh(); }
    } catch { toast.error("Failed to remove target from list"); }
    finally { setRemovingId(null); }
  };
  return <Stack spacing={2.5}>
    <Paper variant="outlined" sx={{ p: 3, borderRadius: "var(--radius)" }}>
      <Typography variant="h5" component="h2" sx={{ fontWeight: 600 }}>{data.name}</Typography>
      <Typography variant="body2" color="text.secondary">ID: {data.id}</Typography>
      <Divider sx={{ my: 2 }} />
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 6 }}><Field label="Description" value={data.description} /><Field label="Status" value={data.status ? "Active" : "Inactive"} /></Grid>
        <Grid size={{ xs: 12, md: 6 }}><Field label="Created by" value={data.crate_by_user?.name} /><Field label="Created on" value={data.created_on ? moment(data.created_on).format("MMM DD YYYY") : "N/A"} /></Grid>
      </Grid>
    </Paper>
    <Paper variant="outlined" sx={{ p: 3, borderRadius: "var(--radius)" }}>
      <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ justifyContent: "space-between", alignItems: { sm: "center" } }}>
        <Typography variant="h6" component="h2" sx={{ fontWeight: 600 }}>Targets ({data.targets?.length || 0})</Typography>
        <Stack direction="row" spacing={1}>
          <ExportTargetsButton getTargets={() => (data.targets ?? []).map((item: any) => item.target).filter(Boolean)} filenameBase={`${(data.name || "target-list").replace(/[^a-z0-9-_]+/gi, "-").toLowerCase()}-targets`} disabled={!data.targets?.length} />
          <Button variant="outlined" size="small" onClick={() => setAddOpen(true)}>+ Add Target</Button>
        </Stack>
      </Stack>
      <Divider sx={{ my: 2 }} />
      {!data.targets?.length ? <Typography variant="body2" color="text.secondary">No targets in this list yet.</Typography> : <Stack spacing={1}>
        {data.targets.map((item: any) => <Paper variant="outlined" key={item.target_id} sx={{ p: 1.5 }}><Stack direction="row" spacing={2} sx={{ alignItems: "center" }}>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Link href={`/crm/targets/${item.target?.id}`} style={{ fontWeight: 600 }}>{item.target?.first_name} {item.target?.last_name}</Link>
            <Typography variant="caption" color="text.secondary" sx={{ display: "block" }}>{item.target?.email || item.target?.mobile_phone || "No contact info"}</Typography>
          </Box>
          {item.target?.company && <Chip size="small" variant="outlined" label={item.target.company} />}
          <IconButton size="small" color="error" aria-label="Remove target" disabled={removingId === item.target_id} onClick={() => handleRemove(item.target_id)}><Trash2 size={17} /></IconButton>
        </Stack></Paper>)}
      </Stack>}
    </Paper>
    <AddTargetToListModal targetListId={data.id} existingTargetIds={existingTargetIds} open={addOpen} onOpenChange={setAddOpen} />
  </Stack>;
}
