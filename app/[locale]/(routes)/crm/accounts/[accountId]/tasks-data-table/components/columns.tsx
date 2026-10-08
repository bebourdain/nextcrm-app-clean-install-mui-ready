"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Box, Chip, Stack, Typography } from "@mui/material";
import moment from "moment";
import { labels, priorities, statuses } from "../data/data";
import { Task } from "../data/schema";
import { DataTableColumnHeader } from "./data-table-column-header";
import { DataTableRowActions } from "./data-table-row-actions";

export const columns: ColumnDef<Task>[] = [
  {
    accessorKey: "dueDateAt",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Due date" />,
    cell: ({ row }) => <Typography variant="body2" sx={{ minWidth: 80 }}>{moment(row.getValue("dueDateAt")).format("YY-MM-DD")}</Typography>,
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "assigned_user",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Assigned to" />,
    cell: ({ row }) => <Typography variant="body2" sx={{ minWidth: 180 }}>{(row.getValue("assigned_user") as { name?: string } | null)?.name ?? "Unassigned"}</Typography>,
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "title",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Name" />,
    cell: ({ row }) => { const label = labels.find((item) => item.value === row.original.content); return <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>{label && <Chip size="small" variant="outlined" label={label.label} />}<Typography variant="body2" noWrap sx={{ maxWidth: 500, fontWeight: 600 }}>{row.getValue("title")}</Typography></Stack>; },
  },
  {
    accessorKey: "taskStatus",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Status" />,
    cell: ({ row }) => { const status = statuses.find((item) => item.value === row.getValue("taskStatus")); if (!status) return null; return <Box sx={{ display: "flex", alignItems: "center", gap: 1, minWidth: 100 }}>{status.icon && <status.icon className="h-4 w-4" />}<Typography variant="body2">{status.label}</Typography></Box>; },
    filterFn: (row, id, value) => value.includes(row.getValue(id)),
  },
  {
    accessorKey: "priority",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Priority" />,
    cell: ({ row }) => { const priority = priorities.find((item) => item.value === row.getValue("priority")); if (!priority) return null; return <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>{priority.icon && <priority.icon className="h-4 w-4" />}<Typography variant="body2">{priority.label}</Typography></Box>; },
    filterFn: (row, id, value) => value.includes(row.getValue(id)),
  },
  { id: "actions", cell: ({ row }) => <DataTableRowActions row={row} /> },
];
