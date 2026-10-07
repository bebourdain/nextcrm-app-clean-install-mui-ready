"use client";

import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, Typography } from "@mui/material";

export default function MuiDocumentPreview({ isOpen, onClose, loading, document }: { isOpen: boolean; onClose: () => void; loading: boolean; document: any }) {
  const mime = document.document_file_mimeType;
  const url = document.document_file_url || "";
  const image = ["application/png", "application/jpg", "application/jpeg", "application/gif", "images/png", "images/jpg", "images/jpeg", "images/gif", "image/png", "image/jpg", "image/jpeg", "image/gif", "image/webp"].includes(mime);
  return <Dialog open={isOpen} onClose={onClose} fullWidth maxWidth="lg"><DialogTitle>{document.document_name ?? "Document preview"}</DialogTitle><DialogContent sx={{ minHeight: 360 }}>
    {image ? (url ? <Box component="img" alt="Image preview" src={url} sx={{ width: "100%", maxHeight: "70vh", objectFit: "contain" }} /> : <Typography color="text.secondary">No preview available</Typography>) : mime === "application/pdf" ? <Box component="embed" type="application/pdf" src={url} sx={{ width: "100%", height: "70vh" }} /> : <><Typography>This format can not be previewed. Please download the file to view it.</Typography><Button component="a" href={url} download variant="outlined" sx={{ mt: 2 }}>Download</Button></>}
  </DialogContent><DialogActions><Button onClick={onClose} disabled={loading}>Cancel</Button></DialogActions></Dialog>;
}
