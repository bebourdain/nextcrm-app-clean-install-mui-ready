"use client";

import { useEffect, useState } from "react";
import { Box, Dialog, DialogContent, DialogTitle, Divider, List, ListItemButton, ListItemIcon, ListItemText, TextField, Typography } from "@mui/material";
import AccountCircleOutlinedIcon from "@mui/icons-material/AccountCircleOutlined";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import LogoutIcon from "@mui/icons-material/Logout";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { searchDocuments, type DocumentSearchResult } from "@/actions/documents/search-documents";
import { signOut } from "@/lib/auth-client";

export function CommandComponent() {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [docResults, setDocResults] = useState<DocumentSearchResult[]>([]);
  const router = useRouter();
  const t = useTranslations("CommandComponent");

  useEffect(() => {
    if (searchQuery.length < 2) return;
    let cancelled = false;
    const timeout = setTimeout(() => {
      searchDocuments(searchQuery)
        .then((results) => { if (!cancelled) setDocResults(results); })
        .catch(() => { if (!cancelled) setDocResults([]); });
    }, 300);
    return () => {
      cancelled = true;
      clearTimeout(timeout);
    };
  }, [searchQuery]);

  useEffect(() => {
    const down = (event: KeyboardEvent) => {
      if (event.metaKey && event.key.toLowerCase() === "j") {
        event.preventDefault();
        setOpen((current) => !current);
      }
      if (event.key === "Escape") setOpen(false);
      if (event.metaKey && event.shiftKey && event.key.toLowerCase() === "d") {
        event.preventDefault();
        router.push("/");
        setOpen(false);
      }
      if (event.metaKey && event.shiftKey && event.key.toLowerCase() === "p") {
        event.preventDefault();
        router.push("/profile");
        setOpen(false);
      }
      if (event.metaKey && event.key.toLowerCase() === "k") {
        event.preventDefault();
        signOut().then(() => { window.location.href = "/sign-in"; });
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [router]);

  const navigate = (path: string) => {
    router.push(path);
    setOpen(false);
  };

  return (
    <>
      <Box
        component="kbd"
        title={t("shortcutHint")}
        sx={{ display: { xs: "none", lg: "inline-flex" }, px: 0.75, py: 0.25, borderRadius: 0.75, bgcolor: "action.hover", color: "text.secondary", fontFamily: "monospace", fontSize: 11, whiteSpace: "nowrap" }}
      >
        ⌘ J
      </Box>
      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm" aria-labelledby="command-menu-title">
        <DialogTitle id="command-menu-title" sx={{ position: "absolute", width: 1, height: 1, p: 0, overflow: "hidden", clip: "rect(0 0 0 0)", whiteSpace: "nowrap" }}>
          Command menu
        </DialogTitle>
        <DialogContent sx={{ p: 0 }}>
          <TextField
            autoFocus
            fullWidth
            placeholder={t("placeholder")}
            value={searchQuery}
            onChange={(event) => {
              setSearchQuery(event.target.value);
              setDocResults([]);
            }}
            variant="standard"
            slotProps={{ input: { disableUnderline: true } }}
            sx={{ px: 2, py: 1.5 }}
          />
          <Divider />
          <List sx={{ maxHeight: "min(60vh, 440px)", overflowY: "auto", py: 0.5 }}>
            {docResults.length > 0 && (
              <>
                <Typography variant="caption" color="text.secondary" sx={{ display: "block", px: 2, pt: 1 }}>Documents</Typography>
                {docResults.map((doc) => (
                  <ListItemButton key={doc.id} onClick={() => navigate(`/documents?highlight=${doc.id}`)}>
                    <ListItemIcon sx={{ minWidth: 34 }}><DescriptionOutlinedIcon sx={{ fontSize: 19 }} /></ListItemIcon>
                    <ListItemText primary={doc.name} secondary={doc.summary} slotProps={{ secondary: { noWrap: true } }} />
                  </ListItemButton>
                ))}
                <Divider sx={{ my: 0.5 }} />
              </>
            )}
            <Typography variant="caption" color="text.secondary" sx={{ display: "block", px: 2, pt: 1 }}>{t("settings")}</Typography>
            <ListItemButton onClick={() => navigate("/")}>
              <ListItemIcon sx={{ minWidth: 34 }}><AccountCircleOutlinedIcon sx={{ fontSize: 19 }} /></ListItemIcon>
              <ListItemText primary={t("dashboard")} />
              <Typography variant="caption" color="text.secondary">Shift + ⌘ + D</Typography>
            </ListItemButton>
            <ListItemButton onClick={() => navigate("/profile")}>
              <ListItemIcon sx={{ minWidth: 34 }}><SettingsOutlinedIcon sx={{ fontSize: 19 }} /></ListItemIcon>
              <ListItemText primary={t("profileSettings")} />
              <Typography variant="caption" color="text.secondary">Shift + ⌘ + P</Typography>
            </ListItemButton>
            <ListItemButton onClick={async () => { await signOut(); window.location.href = "/sign-in"; }}>
              <ListItemIcon sx={{ minWidth: 34 }}><LogoutIcon sx={{ fontSize: 19 }} /></ListItemIcon>
              <ListItemText primary={t("logout")} />
              <Typography variant="caption" color="text.secondary">⌘ K</Typography>
            </ListItemButton>
          </List>
        </DialogContent>
      </Dialog>
    </>
  );
}
