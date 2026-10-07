"use client";

import { useState, type MouseEvent } from "react";
import { MoreHorizontal, X } from "lucide-react";
import { Box, Divider, Drawer, IconButton, Menu, MenuItem, Stack, Typography } from "@mui/material";
import { useRouter } from "next/navigation";
import { UpdateLeadForm } from "../../components/UpdateLeadForm";

type ConfigItem = { id: string; name: string };
export function LeadDetailActions({ lead, leadSources, leadStatuses, leadTypes }: { lead: any; leadSources: ConfigItem[]; leadStatuses: ConfigItem[]; leadTypes: ConfigItem[] }) {
  const router = useRouter();
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);
  const [updateOpen, setUpdateOpen] = useState(false);
  const openMenu = (event: MouseEvent<HTMLElement>) => setAnchor(event.currentTarget);
  return <>
    <IconButton aria-label="Lead actions" aria-haspopup="menu" aria-expanded={!!anchor} data-testid="lead-detail-actions-btn" onClick={openMenu} size="small"><MoreHorizontal size={20} /></IconButton>
    <Menu anchorEl={anchor} open={!!anchor} onClose={() => setAnchor(null)}><MenuItem onClick={() => { setAnchor(null); setUpdateOpen(true); }}>Update</MenuItem></Menu>
    <Drawer anchor="right" open={updateOpen} onClose={() => setUpdateOpen(false)} slotProps={{ paper: { sx: { width: { xs: "100%", md: 771 }, maxWidth: "100%" } } }}>
      <Stack direction="row" sx={{ p: 3, alignItems: "flex-start", justifyContent: "space-between", gap: 2 }}>
        <Box><Typography variant="h5">Update lead - {lead?.firstName} {lead?.lastName}</Typography><Typography variant="body2" color="text.secondary">Update lead details</Typography></Box>
        <IconButton aria-label="Close" onClick={() => setUpdateOpen(false)}><X size={18} /></IconButton>
      </Stack>
      <Divider />
      <Box sx={{ overflowY: "auto", py: 3 }}><UpdateLeadForm initialData={lead} setOpen={(open) => { setUpdateOpen(open); if (!open) router.refresh(); }} leadSources={leadSources} leadStatuses={leadStatuses} leadTypes={leadTypes} /></Box>
    </Drawer>
  </>;
}
