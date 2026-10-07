"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Row } from "@tanstack/react-table";
import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Drawer, IconButton, Menu, MenuItem, Typography } from "@mui/material";
import { MoreHorizontal } from "lucide-react";
import { toast } from "sonner";
import { targetSchema } from "../table-data/schema";
import { deleteTarget } from "@/actions/crm/targets/delete-target";
import { UpdateTargetForm } from "../components/UpdateTargetForm";

export function DataTableRowActions<TData>({ row }: { row: Row<TData> }) {
  const router = useRouter();
  const target = targetSchema.parse(row.original);
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [updateOpen, setUpdateOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const onDelete = async () => {
    setLoading(true);
    try {
      const result = await deleteTarget(target.id);
      if (result.error) toast.error(result.error);
      else { toast.success("Target has been deleted"); router.refresh(); }
    } catch { toast.error("Failed to delete target"); }
    finally { setLoading(false); setConfirmOpen(false); }
  };
  return <>
    <IconButton size="small" aria-label="Open target menu" onClick={(event) => setAnchor(event.currentTarget)}><MoreHorizontal size={18} /><span className="sr-only">Open menu</span></IconButton>
    <Menu anchorEl={anchor} open={!!anchor} onClose={() => setAnchor(null)}>
      <MenuItem onClick={() => { setAnchor(null); router.push(`/crm/targets/${target.id}`); }}>View</MenuItem>
      <MenuItem onClick={() => { setAnchor(null); setUpdateOpen(true); }}>Update</MenuItem>
      <MenuItem onClick={() => { setAnchor(null); setConfirmOpen(true); }}>Delete</MenuItem>
    </Menu>
    <Drawer anchor="right" open={updateOpen} onClose={() => setUpdateOpen(false)} slotProps={{ paper: { sx: { width: { xs: "100%", sm: 640 }, p: 3, overflowY: "auto" } } }}>
      <Typography variant="h6" sx={{ fontWeight: 600 }}>Update Target - {target.first_name} {target.last_name}</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>Update target details</Typography>
      <UpdateTargetForm initialData={row.original} setOpen={(value) => { setUpdateOpen(value); if (!value) router.refresh(); }} />
    </Drawer>
    <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
      <DialogTitle>Delete target?</DialogTitle><DialogContent><DialogContentText>This action cannot be undone.</DialogContentText></DialogContent>
      <DialogActions><Button onClick={() => setConfirmOpen(false)} disabled={loading}>Cancel</Button><Button color="error" onClick={onDelete} disabled={loading}>{loading ? "Deleting..." : "Delete"}</Button></DialogActions>
    </Dialog>
  </>;
}
