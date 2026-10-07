"use client";

import { Avatar, Box, Drawer, Typography } from "@mui/material";
import { SIDEBAR_COLLAPSED_WIDTH, SIDEBAR_WIDTH, useMuiSidebar } from "./mui-sidebar-context";
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

interface AppSidebarProps {
  dict: any;
  session: Session;
}

export function AppSidebar({ dict, session }: AppSidebarProps) {
  const { state, isMobile, open, openMobile, setOpenMobile, toggleSidebar } = useMuiSidebar();
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

  const sidebarContent = () => (
    <Box component="aside" aria-label="Sidebar" sx={{ display: "flex", flexDirection: "column", width: "100%", height: "100%", minHeight: 0 }}>
      <Box sx={{ flexShrink: 0, px: isExpanded ? 2 : 0, py: 1 }}>
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
      </Box>
      <Box sx={{ flex: 1, minHeight: 0, overflowY: "auto", overflowX: "hidden" }}>
        <NavMain items={navItems} dict={dict} />
      </Box>
      <Box sx={{ flexShrink: 0, p: isExpanded ? 2 : 1 }}>
        <NavUser user={userData} />
      </Box>
    </Box>
  );

  const drawerPaper = {
    bgcolor: "hsl(var(--sidebar-background))",
    color: "hsl(var(--sidebar-foreground))",
    borderColor: "hsl(var(--sidebar-border))",
    backgroundImage: "none",
    boxSizing: "border-box",
    overflowX: "hidden",
  } as const;

  return (
    <>
      <Drawer
        variant="permanent"
        open
        sx={{
          display: { xs: "none", md: "block" },
          width: open ? SIDEBAR_WIDTH : SIDEBAR_COLLAPSED_WIDTH,
          flexShrink: 0,
          transition: "width 200ms ease",
          "& .MuiDrawer-paper": {
            ...drawerPaper,
            width: open ? SIDEBAR_WIDTH : SIDEBAR_COLLAPSED_WIDTH,
            height: "100svh",
            transition: "width 200ms ease",
          },
        }}
      >
        {sidebarContent()}
      </Drawer>
      <Box
        component="button"
        type="button"
        aria-label="Toggle Sidebar"
        title="Toggle Sidebar"
        onClick={toggleSidebar}
        sx={{
          display: { xs: "none", md: "block" },
          position: "fixed",
          top: 0,
          bottom: 0,
          left: (open ? SIDEBAR_WIDTH : SIDEBAR_COLLAPSED_WIDTH) - 8,
          zIndex: (theme) => theme.zIndex.drawer + 1,
          width: 16,
          p: 0,
          border: 0,
          bgcolor: "transparent",
          cursor: "ew-resize",
          transition: "left 200ms ease",
          "&::after": { content: '""', position: "absolute", top: 0, bottom: 0, left: 7, width: 2, bgcolor: "hsl(var(--sidebar-border))", opacity: 0 },
          "&:hover::after": { opacity: 1 },
        }}
      />
      <Drawer
        variant="temporary"
        anchor="left"
        open={openMobile}
        onClose={() => setOpenMobile(false)}
        sx={{
          display: { xs: "block", md: "none" },
          "& .MuiDrawer-paper": { ...drawerPaper, width: "min(320px, 100vw)", height: "100svh" },
        }}
      >
        {sidebarContent()}
      </Drawer>
    </>
  );
}
