"use client";

import { useState } from "react";
import { Row } from "@tanstack/react-table";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, IconButton, Menu, MenuItem } from "@mui/material";
import { MoreHorizontal } from "lucide-react";
import { deleteDocument } from "@/actions/documents/delete-document";
import { DocumentRow } from "../data/schema";
import { DocumentDetailPanel } from "./document-detail-panel";
import MuiDocumentPreview from "./MuiDocumentPreview";

export function DataTableRowActions({ row }: { row: Row<DocumentRow> }) {
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const document = row.original;
  async function remove() {
    setLoading(true);
    try { await deleteDocument(document.id); router.refresh(); toast.success("Document has been deleted"); }
    catch { toast.error("Something went wrong while deleting document."); }
    finally { setLoading(false); setDeleteOpen(false); }
  }
  return <><MuiDocumentPreview isOpen={viewOpen} onClose={() => setViewOpen(false)} loading={loading} document={document} /><DocumentDetailPanel document={document} open={detailOpen} onClose={() => setDetailOpen(false)} /><IconButton size="small" aria-label="Open menu" onClick={(event) => setAnchor(event.currentTarget)}><MoreHorizontal size={18} /></IconButton><Menu anchorEl={anchor} open={!!anchor} onClose={() => setAnchor(null)}><MenuItem onClick={() => { setAnchor(null); setDetailOpen(true); }}>Details</MenuItem><MenuItem onClick={() => { setAnchor(null); setViewOpen(true); }}>View File</MenuItem><MenuItem onClick={() => { setAnchor(null); setDeleteOpen(true); }} sx={{ color: "error.main" }}>Delete</MenuItem></Menu><Dialog open={deleteOpen} onClose={() => setDeleteOpen(false)}><DialogTitle>Delete document?</DialogTitle><DialogContent><DialogContentText>This document will be deleted.</DialogContentText></DialogContent><DialogActions><Button onClick={() => setDeleteOpen(false)}>Cancel</Button><Button color="error" variant="contained" disabled={loading} onClick={remove}>{loading ? "Deleting…" : "Delete"}</Button></DialogActions></Dialog></>;
}
