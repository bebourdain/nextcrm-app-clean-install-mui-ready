"use client";

import { Box, Divider, Paper, Stack, Typography } from "@mui/material";
import { columns } from "../table-components/columns";
import { TargetListsDataTable } from "../table-components/data-table";
import CreateTargetListModal from "@/components/modals/CreateTargetListModal";

export default function TargetListsView({ data }: { data: any[] }) {
  return <Paper variant="outlined" sx={{ borderRadius: "var(--radius)", overflow: "hidden", boxShadow: "0 1px 2px 0 rgb(0 0 0 / 0.05)" }}>
    <Box sx={{ p: 3, pb: 1.5 }}><Stack direction="row" sx={{ justifyContent: "space-between", alignItems: "center" }}>
      <Typography variant="h5" component="h2" sx={{ fontWeight: 600 }}>Target Lists</Typography>
      <CreateTargetListModal />
    </Stack><Divider sx={{ mt: 2.5 }} /></Box>
    <Box sx={{ px: 3, pb: 3 }}>{!data?.length ? <Typography variant="body2">No target lists found</Typography> : <TargetListsDataTable data={data} columns={columns} />}</Box>
  </Paper>;
}
