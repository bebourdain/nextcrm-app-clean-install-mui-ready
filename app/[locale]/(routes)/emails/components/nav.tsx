"use client";

import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { Box, Button, Stack, Tooltip } from "@mui/material";

interface NavProps {
  isCollapsed: boolean;
  links: { title: string; label?: string; icon: LucideIcon; variant: "default" | "ghost"; href: string }[];
}
export function Nav({ links, isCollapsed }: NavProps) {
  return <Stack component="nav" spacing={0.5} sx={{ p: 1 }} data-collapsed={isCollapsed}>
    {links.map((link, index) => <Tooltip key={`${link.href}-${index}`} title={isCollapsed ? link.title : ""} placement="right">
      <Box><Button component={Link} href={link.href} aria-label={link.title} variant={link.variant === "default" ? "contained" : "text"} color={link.variant === "default" ? "primary" : "inherit"} fullWidth={!isCollapsed} sx={{ minWidth: 0, width: isCollapsed ? 44 : "100%", height: 36, px: isCollapsed ? 0 : 1.5, justifyContent: isCollapsed ? "center" : "flex-start", textTransform: "none" }} startIcon={isCollapsed ? undefined : <link.icon size={16} />}>
        {isCollapsed ? <link.icon size={16} /> : <>{link.title}{link.label && <Box component="span" sx={{ ml: "auto" }}>{link.label}</Box>}</>}
      </Button></Box>
    </Tooltip>)}
  </Stack>;
}
