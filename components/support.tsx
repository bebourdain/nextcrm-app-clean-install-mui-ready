"use client";

import { useState, type MouseEvent } from "react";
import Link from "next/link";
import { Box, IconButton, Popover, Tooltip, Typography } from "@mui/material";
import { HelpCircle } from "lucide-react";
import { DiscordLogoIcon, GitHubLogoIcon } from "@radix-ui/react-icons";

export default function SupportComponent() {
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);

  const open = (event: MouseEvent<HTMLElement>) => setAnchor(event.currentTarget);

  return (
    <>
      <Tooltip title="Help">
        <IconButton
          aria-label="Help"
          aria-haspopup="dialog"
          aria-expanded={Boolean(anchor)}
          onClick={open}
          sx={{ width: 40, height: 40, border: 1, borderColor: "divider", borderRadius: 1, color: "text.primary" }}
        >
          <HelpCircle size={18} />
        </IconButton>
      </Tooltip>
      <Popover
        open={Boolean(anchor)}
        anchorEl={anchor}
        onClose={() => setAnchor(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Box sx={{ width: { xs: 280, sm: 360 }, p: 2, display: "grid", gap: 1.5 }}>
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 1 }}>
            <Typography variant="body2">Need help? Join us on</Typography>
            <IconButton component={Link} href={process.env.NEXT_PUBLIC_DISCORD_INVITE_URL || "#"} target="_blank" rel="noopener noreferrer" aria-label="Discord" size="small" sx={{ border: 1, borderColor: "divider" }}>
              <DiscordLogoIcon />
            </IconButton>
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 1 }}>
            <Typography variant="body2">Find a bug? Create an issue on</Typography>
            <IconButton component={Link} href={process.env.NEXT_PUBLIC_GITHUB_ISSUES_URL || "#"} target="_blank" rel="noopener noreferrer" aria-label="GitHub issues" size="small" sx={{ border: 1, borderColor: "divider" }}>
              <GitHubLogoIcon />
            </IconButton>
          </Box>
        </Box>
      </Popover>
    </>
  );
}
