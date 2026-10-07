"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Box, Checkbox, Chip, Stack, Typography } from "@mui/material";
import moment from "moment";
import { DocumentRow } from "../data/schema";
import { DataTableColumnHeader } from "./data-table-column-header";
import { DataTableRowActions } from "./data-table-row-actions";
import { ProcessingStatusBadge } from "./processing-status-badge";

function getMimeLabel(mimeType: string) {
  if (mimeType === "application/pdf") return "PDF";
  if (mimeType.startsWith("image/") || mimeType.startsWith("images/")) return "IMG";
  if (mimeType.startsWith("application/vnd.openxmlformats")) return "DOCX";
  if (mimeType === "application/msword") return "DOC";
  if (mimeType === "text/plain") return "TXT";
  return "FILE";
}

export const columns: ColumnDef<DocumentRow>[] = [
  {
    id: "select",
    header: ({ table }) => <Checkbox size="small" checked={table.getIsAllPageRowsSelected()} indeterminate={table.getIsSomePageRowsSelected()} onChange={(event) => table.toggleAllPageRowsSelected(event.target.checked)} aria-label="Select all" />,
    cell: ({ row }) => <Checkbox size="small" checked={row.getIsSelected()} onChange={(event) => row.toggleSelected(event.target.checked)} aria-label="Select row" />,
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "createdAt",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Date" />,
    cell: ({ row }) => <Typography variant="body2" color="text.secondary" sx={{ minWidth: 80 }}>{moment(row.getValue("createdAt")).format("YY-MM-DD")}</Typography>,
    enableSorting: true,
  },
  {
    accessorKey: "document_name",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Document" />,
    cell: ({ row }) => {
      const summary = row.original.summary;
      const processing = row.original.processing_status === "PROCESSING" || row.original.processing_status === "PENDING";
      return <Stack direction="row" spacing={1.5} sx={{ alignItems: "flex-start", minWidth: 220 }}><Chip size="small" variant="outlined" label={getMimeLabel(row.original.document_file_mimeType)} /><Box sx={{ minWidth: 0 }}><Typography variant="body2" sx={{ fontWeight: 600 }} noWrap>{row.getValue("document_name")}</Typography>{processing ? <Typography variant="caption" color="text.secondary">Generating summary...</Typography> : summary ? <Typography variant="caption" color="text.secondary" noWrap sx={{ display: "block" }}>{summary}</Typography> : null}</Box></Stack>;
    },
  },
  {
    accessorKey: "document_system_type",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Type" />,
    cell: ({ row }) => { const type = row.getValue("document_system_type") as string | null; return type ? <Chip size="small" variant="outlined" label={type} /> : <Typography color="text.secondary">—</Typography>; },
    filterFn: (row, id, value) => value.includes(row.getValue(id)),
  },
  {
    id: "account",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Account" />,
    cell: ({ row }) => <Typography variant="body2" color={row.original.accounts?.[0]?.account?.name ? "primary" : "text.secondary"}>{row.original.accounts?.[0]?.account?.name ?? "—"}</Typography>,
  },
  {
    accessorKey: "processing_status",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Status" />,
    cell: ({ row }) => <ProcessingStatusBadge status={row.getValue("processing_status")} />,
    filterFn: (row, id, value) => value.includes(row.getValue(id)),
  },
  {
    accessorKey: "assigned_to_user",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Assigned to" />,
    cell: ({ row }) => <Typography variant="body2" sx={{ minWidth: 120 }}>{(row.getValue("assigned_to_user") as { name: string | null } | null)?.name ?? "Unassigned"}</Typography>,
    enableSorting: false,
  },
  { id: "actions", cell: ({ row }) => <DataTableRowActions row={row} /> },
];
