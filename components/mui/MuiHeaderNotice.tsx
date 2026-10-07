"use client";

import { Alert, Snackbar } from "@mui/material";

export type HeaderNotice = {
  message: string;
  severity: "success" | "error";
};

export function MuiHeaderNotice({ notice, onClose }: { notice: HeaderNotice | null; onClose: () => void }) {
  return (
    <Snackbar
      open={Boolean(notice)}
      autoHideDuration={4000}
      onClose={onClose}
      anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
    >
      <Alert severity={notice?.severity ?? "success"} variant="filled" onClose={onClose} sx={{ width: "100%" }}>
        {notice?.message}
      </Alert>
    </Snackbar>
  );
}
