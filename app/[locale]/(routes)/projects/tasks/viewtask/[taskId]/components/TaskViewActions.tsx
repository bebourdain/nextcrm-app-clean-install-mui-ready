"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Box, Button, Divider, Drawer, Stack, Typography } from "@mui/material";
import { CheckSquare, Pencil } from "lucide-react";
import { getTaskDone } from "@/app/[locale]/(routes)/projects/actions/get-task-done";
import UpdateTaskDialog from "@/app/[locale]/(routes)/projects/dialogs/UpdateTask";

export default function TaskViewActions({ taskId, boards, initialData }: { taskId: string; boards: any; initialData: any }) {
  const router = useRouter();
  const [editOpen, setEditOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  async function markDone() {
    setLoading(true);
    try { await getTaskDone(taskId); toast.success("Success"); }
    catch { toast.error("Error"); }
    finally { setLoading(false); router.refresh(); }
  }
  return <Box sx={{ width: "100%" }}><Typography variant="subtitle2">Task Actions</Typography><Divider sx={{ my: 1 }} /><Stack direction="row" spacing={1}>{initialData.taskStatus !== "COMPLETE" && <Button variant="outlined" startIcon={<CheckSquare size={16} />} onClick={markDone} disabled={loading}>{loading ? "Saving…" : "Mark as done"}</Button>}<Button variant="outlined" startIcon={<Pencil size={16} />} onClick={() => setEditOpen(true)}>Edit</Button></Stack><Drawer anchor="right" open={editOpen} onClose={() => setEditOpen(false)}><Box sx={{ width: { xs: "100vw", sm: 600 }, maxWidth: "100vw", p: 3, overflowY: "auto" }}><Typography variant="h6">Edit Task</Typography><Typography color="text.secondary">Update task details, due date, priority, status, and assigned users</Typography><Box sx={{ mt: 3 }}><UpdateTaskDialog boards={boards} initialData={initialData} onDone={() => setEditOpen(false)} /></Box></Box></Drawer></Box>;
}
