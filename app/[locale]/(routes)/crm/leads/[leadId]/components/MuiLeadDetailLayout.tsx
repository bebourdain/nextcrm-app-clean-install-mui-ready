"use client";

import { useState, type ReactNode, type SyntheticEvent } from "react";
import { Box, Divider, Tab, Tabs } from "@mui/material";
import { MuiPageHeader } from "@/components/mui/MuiPageHeader";

export function MuiLeadDetailLayout({ title, description, overview, history }: { title: string; description: string; overview: ReactNode; history: ReactNode }) {
  const [tab, setTab] = useState(0);
  const changeTab = (_event: SyntheticEvent, value: number) => setTab(value);
  return <Box sx={{ width: "100%", pb: 6 }}>
    <MuiPageHeader title={title} description={description} />
    <Divider sx={{ my: 2 }} />
    <Tabs value={tab} onChange={changeTab} aria-label="Lead detail sections" sx={{ mb: 2, borderBottom: 1, borderColor: "divider" }}>
      <Tab id="lead-overview-tab" aria-controls="lead-overview-panel" label="Overview" />
      <Tab id="lead-history-tab" aria-controls="lead-history-panel" label="History" />
    </Tabs>
    <Box id="lead-overview-panel" role="tabpanel" aria-labelledby="lead-overview-tab" hidden={tab !== 0}>{tab === 0 && <Box sx={{ display: "grid", gap: 2.5 }}>{overview}</Box>}</Box>
    <Box id="lead-history-panel" role="tabpanel" aria-labelledby="lead-history-tab" hidden={tab !== 1}>{tab === 1 && history}</Box>
  </Box>;
}
