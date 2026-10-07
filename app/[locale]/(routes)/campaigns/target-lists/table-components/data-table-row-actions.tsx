"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Row } from "@tanstack/react-table";
import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, IconButton, Menu, MenuItem } from "@mui/material";
import { MoreHorizontal } from "lucide-react";
import { toast } from "sonner";
import { targetListSchema } from "../table-data/schema";
import { deleteTargetList } from "@/actions/crm/target-lists/delete-target-list";

export function DataTableRowActions<TData>({ row }: { row: Row<TData> }) {
  const router = useRouter();
  const list = targetListSchema.parse(row.original);
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const onDelete = async () => {
    setLoading(true);
    try {
      const result = await deleteTargetList(list.id);
      if (result.error) toast.error(result.error);
      else { toast.success("Target list has been deleted"); router.refresh(); }
    } catch { toast.error("Failed to delete target list"); }
    finally { setLoading(false); setConfirmOpen(false); }
  };
  return <>
    <IconButton size="small" aria-label="Open target list menu" onClick={(event) => setAnchor(event.currentTarget)}><MoreHorizontal size={18} /><span className="sr-only">Open menu</span></IconButton>
    <Menu anchorEl={anchor} open={!!anchor} onClose={() => setAnchor(null)}>
      <MenuItem onClick={() => { setAnchor(null); router.push(`/crm/target-lists/${list.id}`); }}>View</MenuItem>
      <MenuItem onClick={() => { setAnchor(null); setConfirmOpen(true); }}>Delete</MenuItem>
    </Menu>
    <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
      <DialogTitle>Delete target list?</DialogTitle><DialogContent><DialogContentText>This action cannot be undone.</DialogContentText></DialogContent>
      <DialogActions><Button onClick={() => setConfirmOpen(false)} disabled={loading}>Cancel</Button><Button color="error" onClick={onDelete} disabled={loading}>{loading ? "Deleting..." : "Delete"}</Button></DialogActions>
    </Dialog>
  </>;
}
