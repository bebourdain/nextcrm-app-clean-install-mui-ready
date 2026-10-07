"use client";

import { useState } from "react";
import { Row } from "@tanstack/react-table";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, IconButton, Menu, MenuItem } from "@mui/material";
import { MoreHorizontal } from "lucide-react";
import { taskSchema } from "../data/schema";
import { deleteTask } from "@/actions/projects/delete-task";

export function DataTableRowActions<TData>({ row }: { row: Row<TData> }) {
  const router = useRouter();
  const task = taskSchema.parse(row.original);
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  async function remove() {
    setLoading(true);
    try { const result = await deleteTask({ id: task.id, section: task.section ?? undefined }); if (result?.error) toast.error(result.error); else toast.success("Task deleted successfully"); }
    catch { toast.error("Something went wrong, during deleting task"); }
    finally { setConfirmOpen(false); setLoading(false); router.refresh(); }
  }
  return <><IconButton size="small" aria-label="Open menu" onClick={(event) => setAnchor(event.currentTarget)}><MoreHorizontal size={18} /></IconButton><Menu anchorEl={anchor} open={!!anchor} onClose={() => setAnchor(null)}><MenuItem onClick={() => { setAnchor(null); router.push(`/projects/tasks/viewtask/${task.id}`); }}>View</MenuItem><MenuItem onClick={() => { setAnchor(null); setConfirmOpen(true); }} sx={{ color: "error.main" }}>Delete</MenuItem></Menu><Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}><DialogTitle>Delete task?</DialogTitle><DialogContent><DialogContentText>This task will be removed.</DialogContentText></DialogContent><DialogActions><Button onClick={() => setConfirmOpen(false)}>Cancel</Button><Button color="error" variant="contained" onClick={remove} disabled={loading}>{loading ? "Deleting…" : "Delete"}</Button></DialogActions></Dialog></>;
}
