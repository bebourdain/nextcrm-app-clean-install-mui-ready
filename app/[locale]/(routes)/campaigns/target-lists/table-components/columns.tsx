"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Box, Chip, Typography } from "@mui/material";

import { TargetList } from "../table-data/schema";
import { DataTableColumnHeader } from "./data-table-column-header";
import { DataTableRowActions } from "./data-table-row-actions";
import moment from "moment";

export const columns: ColumnDef<TargetList>[] = [
  {
    accessorKey: "created_on",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Date created" />
    ),
    cell: ({ row }) => (
      <Box sx={{ whiteSpace: "nowrap" }}>{moment(row.getValue("created_on")).format("YY-MM-DD")}</Box>
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Name" />
    ),
    cell: ({ row }) => <Typography variant="body2" sx={{ fontWeight: 600 }}>{row.getValue("name")}</Typography>,
    enableSorting: true,
    enableHiding: true,
  },
  {
    accessorKey: "description",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Description" />
    ),
    cell: ({ row }) => (
      <Typography variant="body2" noWrap sx={{ maxWidth: 300 }}>{row.getValue("description")}</Typography>
    ),
    enableSorting: true,
    enableHiding: true,
  },
  {
    accessorKey: "_count",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Targets" />
    ),
    cell: ({ row }) => (
      <Typography variant="body2">{(row.getValue("_count") as any)?.targets ?? 0}</Typography>
    ),
    enableSorting: false,
    enableHiding: true,
  },
  {
    accessorKey: "status",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Status" />
    ),
    cell: ({ row }) => (
      <Chip size="small" color={row.original.status ? "success" : "default"} label={row.original.status ? "Active" : "Inactive"} />
    ),
    enableSorting: true,
    enableHiding: true,
  },
  {
    id: "actions",
    cell: ({ row }) => <DataTableRowActions row={row} />,
  },
];
