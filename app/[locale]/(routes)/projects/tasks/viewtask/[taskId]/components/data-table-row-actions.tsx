"use client";

import { useState } from "react";
import { Row } from "@tanstack/react-table";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { IconButton, Menu, MenuItem } from "@mui/material";
import { MoreHorizontal } from "lucide-react";
import { taskSchema } from "../data/schema";
import MuiDocumentPreview from "./MuiDocumentPreview";
import { assignDocumentToTask } from "@/actions/projects/assign-document-to-task";

export function DataTableRowActions<TData>({ row }: { row: Row<TData> }) {
  const [open, setOpen] = useState(false);
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);
  const [loading, setLoading] = useState(false);
  const document = taskSchema.parse(row.original);
  const router = useRouter();
  const params = useParams();
  async function runAction() {
    setAnchor(null); setLoading(true);
    try { const result = await assignDocumentToTask({ documentId: document.id, taskId: params?.taskId as string }); if (result?.error) toast.success(result.error); else toast.success("Document was assigned to task"); }
    catch { toast.success("Something went wrong, while assigned to task document to task"); }
    finally { router.refresh(); setLoading(false); }
  }
  return <><MuiDocumentPreview isOpen={open} onClose={() => setOpen(false)} loading={loading} document={document} /><IconButton size="small" aria-label="Open menu" onClick={(event) => setAnchor(event.currentTarget)}><MoreHorizontal size={18} /></IconButton><Menu anchorEl={anchor} open={!!anchor} onClose={() => setAnchor(null)}><MenuItem onClick={runAction} disabled={loading}>Connect to task</MenuItem><MenuItem onClick={() => { setAnchor(null); setOpen(true); }}>View</MenuItem></Menu></>;
}
