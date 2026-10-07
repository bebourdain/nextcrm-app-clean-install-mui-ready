"use client";

import { useState, type ReactNode } from "react";
import { Box, Divider, Stack, Tab, Tabs } from "@mui/material";
import { MuiPageHeader } from "@/components/mui/MuiPageHeader";

export function MuiContactDetailLayout({ title, overview, history }: { title: string; overview: ReactNode; history: ReactNode }) {
  const [tab, setTab] = useState(0);
  return <Box sx={{ width: "100%", pb: 6 }}>
    <MuiPageHeader title={title} description="Everything you need to know about sales potential" />
    <Divider sx={{ my: 2 }} />
    <Tabs value={tab} onChange={(_, value: number) => setTab(value)} sx={{ mb: 3 }}>
      <Tab label="Overview" /><Tab label="History" />
    </Tabs>
    {tab === 0 ? <Stack spacing={2.5}>{overview}</Stack> : history}
  </Box>;
}
