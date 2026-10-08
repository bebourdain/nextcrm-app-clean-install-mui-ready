"use client";

import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, Typography } from "@mui/material";
import type { Task } from "../data/schema";

const imageTypes = new Set([
  "application/png", "application/jpg", "application/jpeg", "application/gif",
  "images/png", "images/jpg", "images/jpeg", "images/gif",
  "image/png", "image/jpg", "image/jpeg", "image/gif", "image/webp",
]);

export function TaskDocumentPreview({ open, onClose, loading, document }: { open: boolean; onClose: () => void; loading: boolean; document: Task }) {
  return <Dialog open={open} onClose={onClose} fullWidth maxWidth="lg">
    <DialogTitle>{document.document_name}</DialogTitle>
    <DialogContent dividers sx={{ minHeight: 400, display: "flex", flexDirection: "column" }}>
      {imageTypes.has(document.document_file_mimeType)
        ? <Box component="img" src={document.document_file_url} alt="Image preview" sx={{ width: "100%", maxHeight: "70vh", objectFit: "contain" }} />
        : document.document_file_mimeType === "application/pdf"
          ? <Box component="embed" type="application/pdf" src={document.document_file_url} sx={{ width: "100%", height: "70vh" }} />
          : <Box sx={{ display: "grid", gap: 2, justifyItems: "start" }}><Typography>This format can not be previewed. Please download the file to view it.</Typography><Button variant="outlined" component="a" href={document.document_file_url}>Download</Button></Box>}
    </DialogContent>
    <DialogActions><Button variant="outlined" onClick={onClose} disabled={loading}>Cancel</Button></DialogActions>
  </Dialog>;
}
