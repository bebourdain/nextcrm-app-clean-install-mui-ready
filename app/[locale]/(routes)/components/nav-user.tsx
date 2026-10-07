"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Avatar, Box, Divider, ListItemButton, Menu, MenuItem, Tooltip, Typography } from "@mui/material";
import { BadgeDollarSign, ChevronsUpDown, LayoutDashboard, LogOut, Settings } from "lucide-react";
import { signOut } from "@/lib/auth-client";
import { useAvatarContext } from "@/context/avatar-context";
import { useSidebar } from "@/components/ui/sidebar";

interface NavUserProps {
  user: {
    id: string;
    name?: string | null;
    email?: string | null;
    avatar?: string | null;
  };
}

export function NavUser({ user }: NavUserProps) {
  const router = useRouter();
  const { avatar } = useAvatarContext();
  const { state, isMobile, setOpenMobile } = useSidebar();
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);
  const showLabels = isMobile || state === "expanded";
  const avatarUrl = avatar || user.avatar || undefined;
  const initials = user.name
    ? user.name.split(" ").map((part) => part[0]).join("").toUpperCase().slice(0, 2)
    : "U";

  const navigate = (url: string) => {
    setAnchor(null);
    if (isMobile) setOpenMobile(false);
    router.push(url);
  };

  const logout = async () => {
    setAnchor(null);
    await signOut();
    window.location.href = "/sign-in";
  };

  const userAvatar = (size: number) => (
    <Avatar
      src={avatarUrl}
      alt={user.name || "User"}
      variant="rounded"
      sx={{ width: size, height: size, flexShrink: 0, borderRadius: "calc(var(--radius) - 2px)", bgcolor: "hsl(var(--sidebar-accent))", color: "hsl(var(--sidebar-accent-foreground))", fontSize: 13 }}
    >
      {initials}
    </Avatar>
  );

  return (
    <>
      <Tooltip title={showLabels ? "" : user.name || user.email || "Account"} placement="right" arrow>
        <ListItemButton
          aria-label="Account menu"
          aria-expanded={Boolean(anchor)}
          onClick={(event) => setAnchor(event.currentTarget)}
          sx={{
            minHeight: showLabels ? 48 : 32,
            px: showLabels ? 1 : 0,
            py: 0,
            gap: 1,
            justifyContent: showLabels ? "flex-start" : "center",
            borderRadius: "calc(var(--radius) - 2px)",
            color: "hsl(var(--sidebar-foreground))",
            "&:hover": { bgcolor: "hsl(var(--sidebar-accent))", color: "hsl(var(--sidebar-accent-foreground))" },
            "&.Mui-focusVisible": { outline: "2px solid hsl(var(--sidebar-ring))", outlineOffset: 1 },
          }}
        >
          {userAvatar(32)}
          {showLabels && (
            <>
              <Box sx={{ minWidth: 0, flex: 1 }}>
                <Typography noWrap sx={{ fontSize: 13, fontWeight: 600 }}>{user.name || user.email || "User"}</Typography>
                {user.name && <Typography noWrap sx={{ fontSize: 11, opacity: 0.75 }}>{user.email}</Typography>}
              </Box>
              <ChevronsUpDown size={16} />
            </>
          )}
        </ListItemButton>
      </Tooltip>
      <Menu
        anchorEl={anchor}
        open={Boolean(anchor)}
        onClose={() => setAnchor(null)}
        sx={{ zIndex: 1500 }}
        anchorOrigin={{ vertical: "top", horizontal: isMobile ? "left" : "right" }}
        transformOrigin={{ vertical: "bottom", horizontal: "left" }}
        slotProps={{ paper: { sx: { width: 256, borderRadius: "var(--radius)", border: "1px solid hsl(var(--sidebar-border))", boxShadow: 3 } } }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, px: 1.5, py: 1 }}>
          {userAvatar(32)}
          <Box sx={{ minWidth: 0 }}>
            <Typography noWrap sx={{ fontSize: 13, fontWeight: 600 }}>{user.name || user.email || "User"}</Typography>
            {user.name && <Typography noWrap sx={{ fontSize: 11, color: "text.secondary" }}>{user.email}</Typography>}
          </Box>
        </Box>
        <Divider />
        <MenuItem onClick={() => navigate("/projects/dashboard")} sx={{ gap: 1.5, fontSize: 14 }}><LayoutDashboard size={16} />Todo Dashboard</MenuItem>
        <MenuItem onClick={() => navigate("/crm/dashboard/" + user.id)} sx={{ gap: 1.5, fontSize: 14 }}><BadgeDollarSign size={16} />Sales Dashboard</MenuItem>
        <Divider />
        <MenuItem onClick={() => navigate("/profile")} sx={{ gap: 1.5, fontSize: 14 }}><Settings size={16} />Profile Settings</MenuItem>
        <Divider />
        <MenuItem onClick={logout} sx={{ gap: 1.5, fontSize: 14 }}><LogOut size={16} />Logout</MenuItem>
      </Menu>
    </>
  );
}
