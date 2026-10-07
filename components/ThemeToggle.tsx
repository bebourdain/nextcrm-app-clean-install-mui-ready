"use client";

import { useState, type MouseEvent } from "react";
import { IconButton, Menu, MenuItem, Tooltip } from "@mui/material";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

export function ThemeToggle() {
  const { setTheme, theme } = useTheme();
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
          <span className="relative flex h-[18px] w-[18px] items-center justify-center">
            <Sun size={18} className="rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon size={18} className="absolute rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          </span>
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
