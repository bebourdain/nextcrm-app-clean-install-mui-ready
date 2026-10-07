"use client";

import { useState, type MouseEvent } from "react";
import { IconButton, Menu, MenuItem, Tooltip } from "@mui/material";
import { useTheme as useMuiTheme } from "@mui/material/styles";
import DarkModeOutlinedIcon from "@mui/icons-material/DarkModeOutlined";
import LightModeOutlinedIcon from "@mui/icons-material/LightModeOutlined";
import { useTheme as useAppTheme } from "next-themes";

export function ThemeToggle() {
  const { setTheme, theme } = useAppTheme();
  const muiTheme = useMuiTheme();
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);

  const openMenu = (event: MouseEvent<HTMLElement>) => setAnchor(event.currentTarget);

  return (
    <>
      <Tooltip title="Toggle theme">
        <IconButton
          aria-label="Toggle theme"
          aria-haspopup="menu"
          aria-expanded={Boolean(anchor)}
          onClick={openMenu}
          sx={{ width: 40, height: 40, border: 1, borderColor: "divider", borderRadius: 1, color: "text.primary" }}
        >
          {muiTheme.palette.mode === "dark"
            ? <DarkModeOutlinedIcon sx={{ fontSize: 20 }} />
            : <LightModeOutlinedIcon sx={{ fontSize: 20 }} />}
        </IconButton>
      </Tooltip>
      <Menu anchorEl={anchor} open={Boolean(anchor)} onClose={() => setAnchor(null)}>
        {(["light", "dark", "system"] as const).map((mode) => (
          <MenuItem
            key={mode}
            selected={theme === mode}
            onClick={() => {
              setTheme(mode);
              setAnchor(null);
            }}
          >
            {mode[0].toUpperCase() + mode.slice(1)}
          </MenuItem>
        ))}
      </Menu>
    </>
  );
}
