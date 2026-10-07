"use client";

import { ColumnDef } from "@tanstack/react-table";

import { Box, Chip } from "@mui/material";


import { labels, priorities, statuses } from "../data/data";
import { Task } from "../data/schema";
import { DataTableColumnHeader } from "./data-table-column-header";
import { DataTableRowActions } from "./data-table-row-actions";
import moment from "moment";

export const columns: ColumnDef<Task>[] = [
  /*   {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected()}
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
        className="translate-y-[2px]"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
        className="translate-y-[2px]"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  }, */
  {
    accessorKey: "dueDateAt",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Due date" />
    ),
    cell: ({ row }) => (
      <Box sx={{ width: 80 }}>
        {moment(row.getValue("dueDateAt")).format("YY-MM-DD")}
      </Box>
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "assigned_user",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Assigned to" />
    ),

    cell: ({ row }) => (
      <Box sx={{ width: 180 }}>
        {
          //@ts-ignore
          //TODO: fix this
          row.getValue("assigned_user")?.name ?? "Unassigned"
        }
      </Box>
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "title",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Title" />
    ),
    cell: ({ row }) => {
      const label = labels.find(
        (label) => label.value === row.original.content
      );

      return (
        <Box sx={{ display: "flex", gap: 1 }}>
          {label && <Chip size="small" variant="outlined" label={label.label} />}
          <span className="max-w-[500px] truncate font-medium">
            {row.getValue("title")}
          </span>
        </Box>
      );
    },
  },
  {
    accessorKey: "taskStatus",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Status" />
    ),
    cell: ({ row }) => {
      const status = statuses.find(
        (status) => status.value === row.getValue("taskStatus")
      );

      if (!status) {
        return null;
      }

      return (
        <Box sx={{ display: "flex", alignItems: "center", width: 100 }}>
          {status.icon && (
            <status.icon className="mr-2 h-4 w-4 text-muted-foreground" />
          )}
          <span>{status.label}</span>
        </Box>
      );
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
  },
  {
    accessorKey: "priority",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Priority" />
    ),
    cell: ({ row }) => {
      const priority = priorities.find(
        (priority) => priority.value === row.getValue("priority")
      );

      if (!priority) {
        return null;
      }

      return (
        <Box sx={{ display: "flex", alignItems: "center" }}>
          {priority.icon && (
            <priority.icon className="mr-2 h-4 w-4 text-muted-foreground" />
          )}
          <span>{priority.label}</span>
        </Box>
      );
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
  },
  {
    id: "actions",
    cell: ({ row }) => <DataTableRowActions row={row} />,
  },
];
