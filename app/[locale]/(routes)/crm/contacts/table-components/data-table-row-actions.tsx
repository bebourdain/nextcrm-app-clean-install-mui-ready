"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Row } from "@tanstack/react-table";
import { Box, Divider, Drawer, IconButton, Menu, MenuItem, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Button, Stack, Typography } from "@mui/material";
import { MoreHorizontal, X } from "lucide-react";
import { toast } from "sonner";
import { opportunitySchema } from "../table-data/schema";
import { UpdateContactForm } from "../components/UpdateContactForm";
import { deleteContact } from "@/actions/crm/contacts/delete-contact";

type ConfigItem = { id: string; name: string };

export function DataTableRowActions<TData>({ row, contactTypes }: { row: Row<TData>; contactTypes: ConfigItem[] }) {
  const router = useRouter();
  const contact = opportunitySchema.parse(row.original);
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [updateOpen, setUpdateOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const onDelete = async () => {
    setLoading(true);
    try {
      const result = await deleteContact(contact.id);
      if (result.error) toast.error(result.error);
      else toast.success("Contact has been deleted");
    } catch {
      toast.error("Something went wrong while deleting contact. Please try again.");
    } finally {
      setLoading(false);
      setDeleteOpen(false);
      router.refresh();
    }
  };

  return <>
    <IconButton size="small" aria-label="Open contact menu" onClick={(event) => setAnchor(event.currentTarget)}><MoreHorizontal size={18} /><span className="sr-only">Open menu</span></IconButton>
    <Menu anchorEl={anchor} open={!!anchor} onClose={() => setAnchor(null)}>
      <MenuItem onClick={() => { setAnchor(null); router.push(`/crm/contacts/${contact.id}`); }}>View</MenuItem>
      <MenuItem onClick={() => { setAnchor(null); setUpdateOpen(true); }}>Update</MenuItem>
      <MenuItem onClick={() => { setAnchor(null); setDeleteOpen(true); }}>Delete</MenuItem>
    </Menu>
    <Drawer anchor="right" open={updateOpen} onClose={() => setUpdateOpen(false)} slotProps={{ paper: { role: "dialog", ...{ "data-state": "open" }, sx: { width: { xs: "100%", md: 771 }, maxWidth: "100%" } } }}>
      <Stack direction="row" sx={{ p: 3, alignItems: "flex-start", justifyContent: "space-between", gap: 2 }}>
        <Box><Typography variant="h5">Update Contact - {contact.first_name} {contact.last_name}</Typography><Typography variant="body2" color="text.secondary">Update contact details</Typography></Box>
        <IconButton aria-label="Close" onClick={() => setUpdateOpen(false)}><X size={18} /></IconButton>
      </Stack>
      <Divider />
      <Box sx={{ overflowY: "auto", px: { xs: 2, md: 4 }, py: 3 }}>
        <UpdateContactForm initialData={row.original} contactTypes={contactTypes} setOpen={(value) => { setUpdateOpen(value); if (!value) router.refresh(); }} />
      </Box>
    </Drawer>
    <Dialog open={deleteOpen} onClose={() => setDeleteOpen(false)}>
      <DialogTitle>Delete contact?</DialogTitle>
      <DialogContent><DialogContentText>This action cannot be undone.</DialogContentText></DialogContent>
      <DialogActions><Button onClick={() => setDeleteOpen(false)} disabled={loading}>Cancel</Button><Button color="error" onClick={onDelete} disabled={loading}>{loading ? "Deleting..." : "Delete"}</Button></DialogActions>
    </Dialog>
  </>;
}
