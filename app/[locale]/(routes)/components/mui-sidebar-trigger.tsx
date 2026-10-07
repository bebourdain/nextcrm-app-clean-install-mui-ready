"use client";

import { IconButton } from "@mui/material";
import { PanelLeft } from "lucide-react";
import { useMuiSidebar } from "./mui-sidebar-context";

export function MuiSidebarTrigger() {
  const { toggleSidebar } = useMuiSidebar();

  return (
    <IconButton
      aria-label="Toggle Sidebar"
      onClick={toggleSidebar}
      size="small"
      sx={{ width: 28, height: 28, color: "text.primary" }}
    >
      <PanelLeft size={16} />
    </IconButton>
  );
}
