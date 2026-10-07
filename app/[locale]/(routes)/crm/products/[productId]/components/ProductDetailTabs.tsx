"use client";

import { useState, type ReactNode } from "react";
import { Box, Divider, Tab, Tabs } from "@mui/material";

export function ProductDetailTabs({ basic, accounts, history, accountCount }: { basic: ReactNode; accounts: ReactNode; history: ReactNode; accountCount: number }) {
  const [tab, setTab] = useState(0);
  return <Box>
    <Tabs value={tab} onChange={(_, value: number) => setTab(value)} aria-label="Product details">
      <Tab label="Basic" id="product-tab-0" /><Tab label={`Accounts (${accountCount})`} id="product-tab-1" /><Tab label="History" id="product-tab-2" />
    </Tabs>
    <Divider />
    <Box role="tabpanel" aria-labelledby={`product-tab-${tab}`} sx={{ pt: 3 }}>
      {tab === 0 ? basic : tab === 1 ? accounts : history}
    </Box>
  </Box>;
}
