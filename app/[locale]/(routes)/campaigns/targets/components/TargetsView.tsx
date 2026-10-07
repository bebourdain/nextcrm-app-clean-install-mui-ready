"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Box, Button, Divider, Drawer, Paper, Stack, Typography } from "@mui/material";
import { columns } from "../table-components/columns";
import { NewTargetForm } from "./NewTargetForm";
import { TargetsDataTable } from "../table-components/data-table";
import ImportTargetsModal from "@/components/modals/ImportTargetsModal";

export default function TargetsView({ data }: { data: any[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  return <Paper variant="outlined" sx={{ borderRadius: "var(--radius)", overflow: "hidden", boxShadow: "0 1px 2px 0 rgb(0 0 0 / 0.05)" }}>
    <Box sx={{ p: 3, pb: 1.5 }}><Stack direction="row" sx={{ justifyContent: "space-between", alignItems: "center" }}>
      <Typography variant="h5" component="h2" sx={{ fontWeight: 600 }}>Targets</Typography>
      <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}><ImportTargetsModal /><Button variant="contained" onClick={() => setOpen(true)}>+ New Target</Button></Stack>
    </Stack><Divider sx={{ mt: 2.5 }} /></Box>
    <Box sx={{ px: 3, pb: 3 }}>{!data?.length ? <Typography variant="body2">No targets found</Typography> : <TargetsDataTable data={data} columns={columns} />}</Box>
    <Drawer anchor="right" open={open} onClose={() => setOpen(false)} slotProps={{ paper: { sx: { width: { xs: "100%", sm: 640 }, p: 3, overflowY: "auto" } } }}>
      <Typography variant="h6" sx={{ fontWeight: 600 }}>Create new Target</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>Add a new target to your CRM system.</Typography>
      <NewTargetForm onFinish={() => { setOpen(false); router.refresh(); }} />
    </Drawer>
  </Paper>;
}
