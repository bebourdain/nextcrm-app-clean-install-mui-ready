"use client";

import { ColumnDef } from "@tanstack/react-table";

import { Box, Chip } from "@mui/material";

import { visibility } from "../data/data";
import { Task } from "../data/schema";
import { DataTableColumnHeader } from "./data-table-column-header";
import { DataTableRowActions } from "./data-table-row-actions";
import moment from "moment";
import Link from "next/link";

export const columns: ColumnDef<Task>[] = [
  {
    accessorKey: "date_created",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Date Created" />
    ),
    cell: ({ row }) => (
      <Box sx={{ width: 80 }}>
        {moment(row.getValue("date_created")).format("YY-MM-DD")}
      </Box>
    ),
    enableSorting: true,
    enableHiding: false,
  },
  {
    accessorKey: "assigned_user",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Assigned to" />
    ),

    cell: ({ row }) => (
      <Box sx={{ width: 150 }}>
        {row.original.assigned_user.name ?? "Unassigned"}
      </Box>
    ),
    enableSorting: true,
    enableHiding: true,
  },

  {
    accessorKey: "title",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Name" />
    ),
    cell: ({ row }) => (
      <Link href={`/projects/boards/${row.original.id}`}>
        <Box sx={{ width: 300 }}>{row.getValue("title")}</Box>
      </Link>
    ),
  },
  {
    accessorKey: "description",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Description" />
    ),
    cell: ({ row }) => (
      <Box sx={{ width: 300 }}>{row.getValue("description")}</Box>
    ),
  },
  {
    accessorKey: "visibility",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Visibility" />
    ),
    cell: ({ row }) => {
      const status = visibility.find(
        (status) => status.value === row.getValue("visibility")
      );

      if (!status) {
        return null;
      }

      return (
        <Box sx={{ display: "flex", alignItems: "center", width: 100 }}>
          {status.label && <Chip size="small" variant="outlined" label={status.label} />}
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
