"use client";

import * as React from "react";
import { Avatar, Box, Typography } from "@mui/material";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar";
import { NavMain } from "./nav-main";
import { NavUser } from "./nav-user";
import getDashboardMenuItem from "./menu-items/Dashboard";
import getCrmMenuItem from "./menu-items/Crm";
import getProjectsMenuItem from "./menu-items/Projects";
import getEmailsMenuItem from "./menu-items/Emails";
import getReportsMenuItem from "./menu-items/Reports";
import getDocumentsMenuItem from "./menu-items/Documents";
import getInvoicesMenuItem from "./menu-items/Invoices";
import getAdministrationMenuItem from "./menu-items/Administration";
import getCampaignsMenuItem from "./menu-items/Campaigns";
import { Palette } from "lucide-react";

// The shared sidebar provider keeps desktop collapse, mobile drawer, keyboard
// shortcut, and saved open state. MUI renders its visible navigation and account UI.

interface User {
  id: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
  role?: string | null;
  userStatus?: string;
  userLanguage?: string;
  lastLoginAt?: Date;
}

interface Session {
  user: User;
}

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  dict: any;
  session: Session;
}

export function AppSidebar({
  dict,
  session,
  ...props
}: AppSidebarProps) {
  const { state, isMobile } = useSidebar();
  const isExpanded = isMobile || state === "expanded";

  const navItems = [
    getDashboardMenuItem({ title: dict?.dashboard || "Dashboard" }),
    getCrmMenuItem({ localizations: dict.crm, role: session?.user?.role ?? undefined }),
    getCampaignsMenuItem({
      localizations: {
        title: "Campaigns",
        campaigns: "All Campaigns",
        templates: "Templates",
        targets: "Targets",
        targetLists: "Target Lists",
      },
    }),
    getProjectsMenuItem({ title: dict?.projects || "Projects" }),
    getEmailsMenuItem({ title: dict?.emails || "Emails" }),
    getReportsMenuItem({ title: dict?.reports || "Reports" }),
    getDocumentsMenuItem({ title: dict?.documents || "Documents" }),
    getInvoicesMenuItem({ title: dict?.invoices || "Invoices" }),
  ];

  // Administration: admin users only
  if (session?.user?.role === "admin") {
    navItems.push(
      getAdministrationMenuItem({ title: dict?.settings || "Administration" }),
    );
  }

  navItems.push({ title: "User Experience", url: "/user-experience", icon: Palette });

  // Prepare user data for NavUser component
  const userData = {
    id: session.user.id,
    name: session.user.name,
    email: session.user.email,
    avatar: session.user.image,
  };

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: isExpanded ? "flex-start" : "center", gap: 1.5, minHeight: 48, py: 0.5 }}>
          <Avatar sx={{ width: isExpanded ? 44 : 32, height: isExpanded ? 44 : 32, bgcolor: "transparent", border: "1px solid hsl(var(--sidebar-border))", color: "hsl(var(--sidebar-foreground))", fontSize: 16, fontWeight: 600, transform: isExpanded ? "rotate(360deg)" : "rotate(0deg)", transition: "transform 500ms" }}>
            N
          </Avatar>
          {isExpanded && (
            <Typography component="h1" noWrap sx={{ fontSize: 20, fontWeight: 600, color: "hsl(var(--sidebar-accent-foreground))" }}>
              {process.env.NEXT_PUBLIC_APP_NAME || "NextCRM"}
            </Typography>
          )}
        </Box>
      </SidebarHeader>

      <SidebarContent>
        <NavMain items={navItems} dict={dict} />
      </SidebarContent>

      <SidebarFooter>
        <NavUser user={userData} />
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}
