"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MoreHorizontal } from "lucide-react";
import { Dialog, DialogContent, DialogContentText, DialogTitle, IconButton, Menu, MenuItem } from "@mui/material";
import { UpdateContactForm } from "../../components/UpdateContactForm";

type ConfigItem = { id: string; name: string };

export function ContactDetailActions({ contact, contactTypes }: { contact: any; contactTypes: ConfigItem[] }) {
  const [updateOpen, setUpdateOpen] = useState(false);
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);
  const router = useRouter();
  return <>
    <IconButton size="small" data-testid="contact-detail-actions-btn" aria-label="Open menu" onClick={(event) => setAnchor(event.currentTarget)}><MoreHorizontal size={20} /></IconButton>
    <Menu anchorEl={anchor} open={!!anchor} onClose={() => setAnchor(null)}>
      <MenuItem onClick={() => { setAnchor(null); setUpdateOpen(true); }}>Update</MenuItem>
    </Menu>
    <Dialog open={updateOpen} onClose={() => setUpdateOpen(false)} fullWidth maxWidth="md" scroll="paper" slotProps={{ paper: { ...{ "data-state": "open" } } }}>
      <DialogTitle>Update Contact - {contact.first_name} {contact.last_name}</DialogTitle>
      <DialogContent dividers>
        <DialogContentText sx={{ mb: 2 }}>Update contact details</DialogContentText>
        <UpdateContactForm initialData={contact} contactTypes={contactTypes} setOpen={(value) => { setUpdateOpen(value); if (!value) router.refresh(); }} />
      </DialogContent>
    </Dialog>
  </>;
}
