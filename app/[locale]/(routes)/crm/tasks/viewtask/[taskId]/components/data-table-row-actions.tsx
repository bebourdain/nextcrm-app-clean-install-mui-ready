"use client";

import { MoreHorizontal } from "lucide-react";
import { Row } from "@tanstack/react-table";
import { IconButton, Menu, MenuItem } from "@mui/material";

import { useParams } from "next/navigation";
import { taskSchema } from "../data/schema";
import { useRouter } from "next/navigation";
import { TaskDocumentPreview } from "./task-document-preview";
import { useState } from "react";
import { toast } from "sonner";
import { assignDocumentToCrmTask } from "@/actions/crm/tasks/assign-document";

interface DataTableRowActionsProps<TData> {
  row: Row<TData>;
}

export function DataTableRowActions<TData>({
  row,
}: DataTableRowActionsProps<TData>) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);
  const document = taskSchema.parse(row.original);

  const router = useRouter();
  const params = useParams();

  const onAssign = async () => {
    setLoading(true);
    try {
      const result = await assignDocumentToCrmTask({
        documentId: document.id,
        taskId: params?.taskId as string,
      });
      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success("Document was assigned to task");
      }
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong, while assigning document to task");
    } finally {
      router.refresh();
      setLoading(false);
    }
  };

  return (
    <>
      <TaskDocumentPreview
        open={open}
        onClose={() => setOpen(false)}
        loading={loading}
        document={document}
      />
      <IconButton aria-label="Open menu" size="small" onClick={(event) => setAnchor(event.currentTarget)}><MoreHorizontal size={18} /></IconButton>
      <Menu anchorEl={anchor} open={Boolean(anchor)} onClose={() => setAnchor(null)}>
        <MenuItem onClick={() => { setAnchor(null); void onAssign(); }} disabled={loading}>Connect to task</MenuItem>
        <MenuItem onClick={() => { setAnchor(null); setOpen(true); }}>View</MenuItem>
      </Menu>
    </>
  );
}
