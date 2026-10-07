"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Box, Collapse, List, ListItemButton, ListItemIcon, Tooltip, Typography } from "@mui/material";
import { ChevronRight, type LucideIcon } from "lucide-react";
import { useSidebar } from "@/components/ui/sidebar";

export interface NavItem {
  title: string;
  url?: string;
  icon?: LucideIcon;
  isActive?: boolean;
  items?: NavSubItem[];
}

export interface NavSubItem {
  title: string;
  url: string;
  isActive?: boolean;
  exact?: boolean;
}

interface NavMainProps {
  items: NavItem[];
  dict?: unknown;
}

const activeBackground = "hsl(var(--sidebar-accent))";
const activeForeground = "hsl(var(--sidebar-accent-foreground))";

export function NavMain({ items }: NavMainProps) {
  const pathname = usePathname();
  const { state, isMobile, setOpen, setOpenMobile } = useSidebar();
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});
  const showLabels = isMobile || state === "expanded";
  const currentPath = pathname.replace(/^\/[a-z]{2}(?=\/|$)/, "") || "/";

  const matchesRoute = (url: string, exact = false) => {
    if (url === "/") return currentPath === "/";
    return currentPath === url || (!exact && currentPath.startsWith(url + "/"));
  };

  const closeMobileMenu = () => {
    if (isMobile) setOpenMobile(false);
  };

  const itemStyles = {
    minHeight: 36,
    borderRadius: "calc(var(--radius) - 2px)",
    px: showLabels ? 1 : 0,
    py: 0,
    gap: showLabels ? 1 : 0,
    justifyContent: showLabels ? "flex-start" : "center",
    color: "hsl(var(--sidebar-foreground))",
    "&:hover": { bgcolor: activeBackground, color: activeForeground },
    "&.Mui-selected": { bgcolor: activeBackground, color: activeForeground },
    "&.Mui-selected:hover": { bgcolor: activeBackground, color: activeForeground },
    "&.Mui-focusVisible": { outline: "2px solid hsl(var(--sidebar-ring))", outlineOffset: 1 },
  } as const;

  return (
    <Box component="nav" aria-label="Main navigation" sx={{ px: showLabels ? 2 : 1, py: 1, minWidth: 0 }}>
      {showLabels && (
        <Typography sx={{ height: 32, display: "flex", alignItems: "center", px: 1, fontSize: 12, fontWeight: 600, color: "hsl(var(--sidebar-foreground))", opacity: 0.7 }}>
          Navigation
        </Typography>
      )}
      <List disablePadding sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
        {items.map((item) => {
          const Icon = item.icon;

          if (item.items?.length) {
            const activeChildren = item.items
              .filter((child) => matchesRoute(child.url, child.exact))
              .sort((left, right) => right.url.length - left.url.length);
            const activeChild = activeChildren[0];
            const isOpen = expandedGroups[item.title] ?? Boolean(activeChild);

            return (
              <Box key={item.title}>
                <Tooltip title={showLabels ? "" : item.title} placement="right" arrow>
                  <ListItemButton
                    selected={Boolean(activeChild)}
                    aria-label={item.title}
                    aria-expanded={showLabels && isOpen}
                    onClick={() => {
                      if (!showLabels) {
                        setOpen(true);
                        setExpandedGroups((current) => ({ ...current, [item.title]: true }));
                      } else {
                        setExpandedGroups((current) => ({ ...current, [item.title]: !isOpen }));
                      }
                    }}
                    sx={itemStyles}
                  >
                    {Icon && <ListItemIcon sx={{ minWidth: 18, color: "inherit", "& svg": { width: 18, height: 18 } }}><Icon /></ListItemIcon>}
                    {showLabels && (
                      <>
                        <Typography noWrap sx={{ flex: 1, fontSize: 14, fontWeight: activeChild ? 600 : 500 }}>{item.title}</Typography>
                        <ChevronRight size={16} style={{ transform: isOpen ? "rotate(90deg)" : "none", transition: "transform 150ms" }} />
                      </>
                    )}
                  </ListItemButton>
                </Tooltip>
                <Collapse in={showLabels && isOpen} timeout="auto" unmountOnExit>
                  <List disablePadding sx={{ ml: 2, pl: 1.25, py: 0.5, borderLeft: "1px solid hsl(var(--sidebar-border))", display: "flex", flexDirection: "column", gap: 0.5 }}>
                    {item.items.map((child) => {
                      const isActive = activeChild?.url === child.url;
                      return (
                        <ListItemButton
                          key={child.url}
                          component={Link}
                          href={child.url}
                          selected={isActive}
                          aria-current={isActive ? "page" : undefined}
                          onClick={closeMobileMenu}
                          sx={{
                            minHeight: 32,
                            borderRadius: "calc(var(--radius) - 2px)",
                            px: 1,
                            py: 0,
                            color: "hsl(var(--sidebar-foreground))",
                            "&:hover": { bgcolor: activeBackground, color: activeForeground },
                            "&.Mui-selected": { bgcolor: activeBackground, color: activeForeground },
                            "&.Mui-selected:hover": { bgcolor: activeBackground, color: activeForeground },
                            "&.Mui-focusVisible": { outline: "2px solid hsl(var(--sidebar-ring))", outlineOffset: 1 },
                          }}
                        >
                          <Typography noWrap sx={{ fontSize: 14, fontWeight: isActive ? 600 : 400 }}>{child.title}</Typography>
                        </ListItemButton>
                      );
                    })}
                  </List>
                </Collapse>
              </Box>
            );
          }

          if (!item.url) return null;
          const isActive = matchesRoute(item.url);
          return (
            <Tooltip key={item.title} title={showLabels ? "" : item.title} placement="right" arrow>
              <ListItemButton
                component={Link}
                href={item.url}
                selected={isActive}
                aria-label={item.title}
                aria-current={isActive ? "page" : undefined}
                onClick={closeMobileMenu}
                sx={itemStyles}
              >
                {Icon && <ListItemIcon sx={{ minWidth: 18, color: "inherit", "& svg": { width: 18, height: 18 } }}><Icon /></ListItemIcon>}
                {showLabels && <Typography noWrap sx={{ fontSize: 14, fontWeight: isActive ? 600 : 500 }}>{item.title}</Typography>}
              </ListItemButton>
            </Tooltip>
          );
        })}
      </List>
    </Box>
  );
}
