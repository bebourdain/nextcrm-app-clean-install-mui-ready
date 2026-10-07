"use client";

import { useState } from "react";
import { Box, Tab, Tabs } from "@mui/material";
import { ConfigList } from "./ConfigList";
import type { CrmConfigType, ConfigValue } from "../_actions/crm-settings";

type TabConfig = { key: CrmConfigType; label: string; values: ConfigValue[] };
export function CrmSettingsTabs({ tabs }: { tabs: TabConfig[] }) {
  const [current, setCurrent] = useState<CrmConfigType | undefined>(tabs[0]?.key);
  const selected = tabs.find((tab) => tab.key === current);
  return <Box><Tabs value={current ?? false} onChange={(_, value: CrmConfigType) => setCurrent(value)} variant="scrollable" scrollButtons="auto" sx={{ borderBottom: 1, borderColor: "divider" }}>{tabs.map((tab) => <Tab key={tab.key} value={tab.key} label={tab.label} />)}</Tabs>{selected && <Box sx={{ mt: 3 }}><ConfigList configType={selected.key} label={selected.label} values={selected.values} /></Box>}</Box>;
}
