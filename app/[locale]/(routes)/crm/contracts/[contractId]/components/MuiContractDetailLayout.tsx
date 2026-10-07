"use client";

import { useState, type ReactNode, type SyntheticEvent } from "react";
import { Box, Divider, Tab, Tabs } from "@mui/material";
import { MuiPageHeader } from "@/components/mui/MuiPageHeader";

interface Props {
  title: string;
  description: string;
  overview: ReactNode;
  history: ReactNode;
}

export function MuiContractDetailLayout({ title, description, overview, history }: Props) {
  const [tab, setTab] = useState(0);

  const changeTab = (_event: SyntheticEvent, value: number) => setTab(value);

  return (
    <Box sx={{ width: "100%", pb: 6 }}>
      <MuiPageHeader title={title} description={description} />
      <Divider sx={{ my: 2 }} />
      <Tabs value={tab} onChange={changeTab} aria-label="Contract detail sections" sx={{ mb: 2, borderBottom: 1, borderColor: "divider" }}>
        <Tab id="contract-overview-tab" aria-controls="contract-overview-panel" label="Overview" />
        <Tab id="contract-history-tab" aria-controls="contract-history-panel" label="History" />
      </Tabs>
      <Box id="contract-overview-panel" role="tabpanel" aria-labelledby="contract-overview-tab" hidden={tab !== 0}>
        {tab === 0 && <Box sx={{ display: "grid", gap: 2.5 }}>{overview}</Box>}
      </Box>
      <Box id="contract-history-panel" role="tabpanel" aria-labelledby="contract-history-tab" hidden={tab !== 1}>
        {tab === 1 && history}
      </Box>
    </Box>
  );
}
