"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { Box, useMediaQuery, useTheme } from "@mui/material";

export const SIDEBAR_WIDTH = 320;
export const SIDEBAR_COLLAPSED_WIDTH = 48;

type MuiSidebarContextValue = {
  state: "expanded" | "collapsed";
  open: boolean;
  setOpen: (value: boolean | ((current: boolean) => boolean)) => void;
  openMobile: boolean;
  setOpenMobile: (value: boolean | ((current: boolean) => boolean)) => void;
  isMobile: boolean;
  toggleSidebar: () => void;
};

const MuiSidebarContext = createContext<MuiSidebarContextValue | null>(null);

export function useMuiSidebar() {
  const context = useContext(MuiSidebarContext);
  if (!context) throw new Error("useMuiSidebar must be used within MuiSidebarProvider.");
  return context;
}

export function MuiSidebarProvider({ defaultOpen, children }: { defaultOpen: boolean; children: ReactNode }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [open, setOpen] = useState(defaultOpen);
  const [openMobile, setOpenMobile] = useState(false);

  useEffect(() => {
    document.cookie = `sidebar_state=${open}; path=/; max-age=${60 * 60 * 24 * 7}`;
  }, [open]);

  const toggleSidebar = useCallback(() => {
    if (isMobile) setOpenMobile((current) => !current);
    else setOpen((current) => !current);
  }, [isMobile]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() === "b" && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        toggleSidebar();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [toggleSidebar]);

  const value = useMemo<MuiSidebarContextValue>(() => ({
    state: open ? "expanded" : "collapsed",
    open,
    setOpen,
    openMobile,
    setOpenMobile,
    isMobile,
    toggleSidebar,
  }), [open, openMobile, isMobile, toggleSidebar]);

  return (
    <MuiSidebarContext.Provider value={value}>
      <Box sx={{ display: "flex", minHeight: "100svh", width: "100%" }}>
        {children}
      </Box>
    </MuiSidebarContext.Provider>
  );
}
