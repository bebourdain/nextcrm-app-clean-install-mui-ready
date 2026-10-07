"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MoreHorizontal, X } from "lucide-react";
import { Box, Divider, Drawer, IconButton, Menu, MenuItem, Typography } from "@mui/material";
import { UpdateAccountForm } from "../../components/UpdateAccountForm";

export function AccountDetailActions({ account }: { account: any }) {
  const router = useRouter();
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);
  const [updateOpen, setUpdateOpen] = useState(false);
  return <>
    <IconButton size="small" aria-label="Account actions" data-testid="account-detail-actions-btn" onClick={(event) => setAnchor(event.currentTarget)}><MoreHorizontal size={20} /></IconButton>
    <Menu anchorEl={anchor} open={Boolean(anchor)} onClose={() => setAnchor(null)}><MenuItem onClick={() => { setAnchor(null); setUpdateOpen(true); }}>Update</MenuItem></Menu>
    <Drawer anchor="right" open={updateOpen} onClose={() => setUpdateOpen(false)} slotProps={{ paper: { sx: { width: { xs: "100%", md: 771 }, maxWidth: "100%" } } }}>
      <Box sx={{ p: 3, display: "flex", justifyContent: "space-between" }}><Box><Typography variant="h5">Update Account - {account.name}</Typography><Typography variant="body2" color="text.secondary">Update account details</Typography></Box><IconButton aria-label="Close" onClick={() => setUpdateOpen(false)}><X size={18} /></IconButton></Box>
      <Divider />
      <Box sx={{ overflowY: "auto", py: 3 }}><UpdateAccountForm initialData={account} open={(open) => { setUpdateOpen(open); if (!open) router.refresh(); }} /></Box>
    </Drawer>
  </>;
}
