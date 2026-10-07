"use client";

import { useState, type ReactNode, type SyntheticEvent } from "react";
import { Box, Divider, Tab, Tabs } from "@mui/material";
import { MuiPageHeader } from "@/components/mui/MuiPageHeader";

export function MuiAccountDetailLayout({ title, description, overview, history }: { title: string; description: string; overview: ReactNode; history: ReactNode }) {
  const [tab, setTab] = useState(0);
  return <Box sx={{ width: "100%", pb: 6 }}>
    <MuiPageHeader title={title} description={description} />
    <Divider sx={{ my: 2 }} />
    <Tabs value={tab} onChange={(_event: SyntheticEvent, value: number) => setTab(value)} aria-label="Account detail sections" sx={{ mb: 2, borderBottom: 1, borderColor: "divider" }}>
      <Tab id="account-overview-tab" aria-controls="account-overview-panel" label="Overview" />
      <Tab id="account-history-tab" aria-controls="account-history-panel" label="History" />
    </Tabs>
    <Box id="account-overview-panel" role="tabpanel" aria-labelledby="account-overview-tab" hidden={tab !== 0}>{tab === 0 && <Box sx={{ display: "grid", gap: 2.5 }}>{overview}</Box>}</Box>
    <Box id="account-history-panel" role="tabpanel" aria-labelledby="account-history-tab" hidden={tab !== 1}>{tab === 1 && history}</Box>
  </Box>;
}
