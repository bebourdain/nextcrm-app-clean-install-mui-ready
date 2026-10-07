"use client";

import { ColumnDef } from "@tanstack/react-table";

import { Box, Chip } from "@mui/material";


import { labels, priorities, statuses } from "../data/data";
import { Task } from "../data/schema";
import { DataTableColumnHeader } from "./data-table-column-header";
import { DataTableRowActions } from "./data-table-row-actions";
import moment from "moment";
import { DataTableRowActionsTasks } from "./data-table-row-actions-tasks";

export const columnsTask: ColumnDef<Task>[] = [
  {
    accessorKey: "assigned_to_user",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Assigned to" />
    ),

    cell: ({ row }) => (
      <Box sx={{ width: 150 }}>
        {
          //@ts-ignore
          //TODO: fix this - must change schema but problem is if value is null now. You must change db
          row.original.assigned_to_user.name ?? "Unassigned"
        }
      </Box>
    ),
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
        <Box sx={{ display: "flex", gap: 1 }}>
          {label && <Chip size="small" variant="outlined" label={label.label} />}
          <span className="max-w-[500px] truncate font-medium">
            {row.original.document_name}
          </span>
        </Box>
      );
    },
  },

  {
    id: "actions",
    cell: ({ row }) => <DataTableRowActionsTasks row={row} />,
  },
];
