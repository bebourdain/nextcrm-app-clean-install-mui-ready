"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from "@mui/material";
import { TrashIcon } from "lucide-react";
import { deleteProject } from "@/actions/projects/delete-project";

export default function DeleteProjectDialog({ boardId, boardName }: { boardId: string; boardName: string }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  async function onDelete() {
    setLoading(true);
    try { const result = await deleteProject(boardId); if (result?.error) toast.error(result.error); else toast.success(`Project: ${boardName} deleted successfully`); }
    catch { toast.error("Something went wrong while deleting project. Please try again."); }
    finally { setOpen(false); setLoading(false); router.refresh(); router.push("/projects"); }
  }
  return <><Button color="error" variant="outlined" startIcon={<TrashIcon size={16} />} onClick={() => setOpen(true)}>Delete project</Button><Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="xs"><DialogTitle>Delete project</DialogTitle><DialogContent><DialogContentText>Are you sure you want to delete this project? You will not be able to recover it. All tasks will be deleted as well.</DialogContentText></DialogContent><DialogActions><Button onClick={() => setOpen(false)}>Cancel</Button><Button color="error" variant="contained" onClick={onDelete} disabled={loading}>{loading ? "Deleting..." : "Delete"}</Button></DialogActions></Dialog></>;
}
