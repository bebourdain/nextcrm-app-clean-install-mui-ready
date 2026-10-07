"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MoreHorizontal, X } from "lucide-react";
import { Box, Divider, Drawer, IconButton, Menu, MenuItem, Stack, Typography } from "@mui/material";
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
    <Drawer anchor="right" open={updateOpen} onClose={() => setUpdateOpen(false)} slotProps={{ paper: { role: "dialog", ...{ "data-state": "open" }, sx: { width: { xs: "100%", md: 771 }, maxWidth: "100%" } } }}>
      <Stack direction="row" sx={{ p: 3, alignItems: "flex-start", justifyContent: "space-between", gap: 2 }}>
        <Box><Typography variant="h5">Update Contact - {contact.first_name} {contact.last_name}</Typography><Typography variant="body2" color="text.secondary">Update contact details</Typography></Box>
        <IconButton aria-label="Close" onClick={() => setUpdateOpen(false)}><X size={18} /></IconButton>
      </Stack>
      <Divider />
      <Box sx={{ overflowY: "auto", px: { xs: 2, md: 4 }, py: 3 }}>
        <UpdateContactForm initialData={contact} contactTypes={contactTypes} setOpen={(value) => { setUpdateOpen(value); if (!value) router.refresh(); }} />
      </Box>
    </Drawer>
  </>;
}
