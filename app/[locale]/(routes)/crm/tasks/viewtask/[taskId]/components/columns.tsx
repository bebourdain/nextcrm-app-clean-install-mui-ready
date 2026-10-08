"use client";

import { ColumnDef } from "@tanstack/react-table";

import { Box, Chip, Stack, Typography } from "@mui/material";

import { labels } from "../data/data";
import { Task } from "../data/schema";
import { DataTableColumnHeader } from "./data-table-column-header";
import { DataTableRowActions } from "./data-table-row-actions";

export const columns: ColumnDef<Task>[] = [
  {
    accessorKey: "assigned_to_user",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Assigned to" />
    ),

    cell: ({ row }) => <Box sx={{ minWidth: 150 }}>{row.original.assigned_to_user?.name ?? "Unassigned"}</Box>,
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "document_name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Document name" />
    ),
    cell: ({ row }) => {
      const label = labels.find(
        (label) => label.value === row.original.document_name
      );

      return (
        <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
          {label && <Chip size="small" variant="outlined" label={label.label} />}
          <Typography variant="body2" noWrap sx={{ maxWidth: 500, fontWeight: 500 }}>{row.original.document_name}</Typography>
        </Stack>
      );
    },
  },

  {
    id: "actions",
    cell: ({ row }) => <DataTableRowActions row={row} />,
  },
];
