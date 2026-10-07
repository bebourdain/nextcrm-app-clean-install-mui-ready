"use client";

import { IconButton } from "@mui/material";
import ViewSidebarOutlinedIcon from "@mui/icons-material/ViewSidebarOutlined";
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
      <ViewSidebarOutlinedIcon sx={{ fontSize: 18 }} />
    </IconButton>
  );
}
