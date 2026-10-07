"use client";

import { useRouter } from "next/navigation";
import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from "@mui/material";

interface NoApiKeyDialogProps { open: boolean; onClose: () => void }

export function NoApiKeyDialog({ open, onClose }: NoApiKeyDialogProps) {
  const router = useRouter();
  const handleGoToSettings = () => { onClose(); router.push("/profile?tab=llms"); };
  return <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
    <DialogTitle>API Keys Required</DialogTitle>
    <DialogContent><DialogContentText>Enrichment requires API keys. Configure them in your profile settings, or ask your admin to set a system-wide key.</DialogContentText></DialogContent>
    <DialogActions><Button onClick={onClose}>Close</Button><Button variant="contained" onClick={handleGoToSettings}>Go to Settings</Button></DialogActions>
  </Dialog>;
}
