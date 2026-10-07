"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { List, ListItemButton, ListItemIcon, ListItemText, Typography } from "@mui/material";
import { Key, Users, Settings, SlidersHorizontal, ClipboardList, Coins, FileText, CalendarClock } from "lucide-react";

const navItems = [
  { label: "LLM Keys", href: "/admin/llm-keys", icon: Key },
  { label: "Users", href: "/admin/users", icon: Users },
  { label: "Services", href: "/admin/services", icon: Settings },
  { label: "CRM Settings", href: "/admin/crm-settings", icon: SlidersHorizontal },
  { label: "Funnel Settings", href: "/admin/funnel-settings", icon: SlidersHorizontal },
  { label: "Calendar Settings", href: "/admin/calendar-settings", icon: CalendarClock },
  { label: "Audit Log", href: "/admin/audit-log", icon: ClipboardList },
  { label: "Currencies", href: "/admin/currencies", icon: Coins },
  { label: "Invoices", href: "/admin/invoices", icon: FileText },
];

export function AdminSidebarNav() {
  const pathname = usePathname();
  return <><Typography variant="overline" color="text.secondary" sx={{ px: 2, display: "block" }}>Admin</Typography><List component="nav" dense sx={{ display: { xs: "flex", md: "block" }, overflowX: { xs: "auto", md: "visible" }, py: 0 }}>{navItems.map(({ label, href, icon: Icon }) => <ListItemButton key={href} component={Link} href={href} selected={pathname.includes(href)} sx={{ borderRadius: 1, whiteSpace: "nowrap", minWidth: { xs: "max-content", md: "auto" } }}><ListItemIcon sx={{ minWidth: 32, color: "inherit" }}><Icon size={18} /></ListItemIcon><ListItemText primary={<Typography variant="body2" sx={{ fontWeight: pathname.includes(href) ? 600 : 400 }}>{label}</Typography>} /></ListItemButton>)}</List></>;
}
