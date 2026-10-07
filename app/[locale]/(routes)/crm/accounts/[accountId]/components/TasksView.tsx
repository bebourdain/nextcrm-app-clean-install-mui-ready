"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { crm_Accounts } from "@prisma/client";
import { Box, Button, Divider, Drawer, IconButton, Paper, Stack, Typography } from "@mui/material";
import { X } from "lucide-react";
import { columns } from "../tasks-data-table/components/columns";
import { TasksDataTable } from "../tasks-data-table/components/data-table";
import NewTaskForm from "./NewTaskForm";

export default function AccountsTasksView({ data, account }: { data: any[]; account: crm_Accounts | null }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  return <Paper variant="outlined" sx={{ p: 3, borderRadius: "var(--radius)" }}>
    <Stack direction="row" sx={{ alignItems: "center", justifyContent: "space-between" }}>
      <Typography variant="h6" sx={{ fontWeight: 600, cursor: "pointer" }} onClick={() => router.push("/projects/tasks")}>Tasks</Typography>
      <Button variant="contained" data-testid="add-task-btn" aria-label="Create task" onClick={() => setOpen(true)} sx={{ minWidth: 36 }}>+</Button>
    </Stack>
    <Divider sx={{ my: 2 }} />
    {!data?.length ? <Typography variant="body2">No assigned tasks found</Typography> : <TasksDataTable data={data} columns={columns} />}
    <Drawer anchor="right" open={open} onClose={() => setOpen(false)} slotProps={{ paper: { sx: { width: { xs: "100%", md: 600 }, maxWidth: "100%" } } }}>
      <Box sx={{ p: 3, display: "flex", justifyContent: "space-between" }}><Box><Typography variant="h5">Create new Task</Typography><Typography variant="body2" color="text.secondary">Create a new task for this account with assigned user, due date, and priority</Typography></Box><IconButton aria-label="Close" onClick={() => setOpen(false)}><X size={18} /></IconButton></Box>
      <Divider />
      <Box sx={{ overflowY: "auto", p: 3 }}><NewTaskForm account={account} onFinish={() => { setOpen(false); router.refresh(); }} /></Box>
    </Drawer>
  </Paper>;
}
