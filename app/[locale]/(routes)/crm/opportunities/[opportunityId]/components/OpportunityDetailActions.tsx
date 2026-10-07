"use client";

import { useState, type MouseEvent } from "react";
import { MoreHorizontal, X } from "lucide-react";
import { Box, Divider, Drawer, IconButton, Menu, MenuItem, Stack, Typography } from "@mui/material";
import { UpdateOpportunityForm } from "../../components/UpdateOpportunityForm";

type ConfigItem = { id: string; name: string };

interface OpportunityDetailActionsProps {
  opportunity: any;
  saleTypes: ConfigItem[];
  saleStages: ConfigItem[];
  campaigns: ConfigItem[];
  currencies: { code: string; name: string; symbol: string }[];
}

export function OpportunityDetailActions({
  opportunity,
  saleTypes,
  saleStages,
  campaigns,
  currencies,
}: OpportunityDetailActionsProps) {
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);
  const [updateOpen, setUpdateOpen] = useState(false);

  const openMenu = (event: MouseEvent<HTMLElement>) => setAnchor(event.currentTarget);

  return (
    <>
      <IconButton
        aria-label="Opportunity actions"
        aria-haspopup="menu"
        aria-expanded={Boolean(anchor)}
        data-testid="opportunity-detail-actions-btn"
        onClick={openMenu}
        size="small"
      >
        <MoreHorizontal size={20} />
      </IconButton>
      <Menu anchorEl={anchor} open={Boolean(anchor)} onClose={() => setAnchor(null)}>
        <MenuItem onClick={() => { setAnchor(null); setUpdateOpen(true); }}>Update</MenuItem>
      </Menu>
      <Drawer
        anchor="right"
        open={updateOpen}
        onClose={() => setUpdateOpen(false)}
        slotProps={{ paper: { sx: { width: { xs: "100%", md: 771 }, maxWidth: "100%" } } }}
      >
        <Stack direction="row" sx={{ p: 3, alignItems: "flex-start", justifyContent: "space-between", gap: 2 }}>
          <Box>
            <Typography variant="h5">Update Opportunity - {opportunity?.name}</Typography>
            <Typography variant="body2" color="text.secondary">Update opportunity details</Typography>
          </Box>
          <IconButton aria-label="Close" onClick={() => setUpdateOpen(false)}><X size={18} /></IconButton>
        </Stack>
        <Divider />
        <Box sx={{ overflowY: "auto", py: 3 }}>
          <UpdateOpportunityForm
            initialData={opportunity}
            setOpen={setUpdateOpen}
            saleTypes={saleTypes}
            saleStages={saleStages}
            campaigns={campaigns}
            currencies={currencies}
          />
        </Box>
      </Drawer>
    </>
  );
}
