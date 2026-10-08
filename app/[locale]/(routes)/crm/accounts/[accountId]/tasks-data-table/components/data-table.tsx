"use client";

import * as React from "react";
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";

import { Box, IconButton, Stack, Typography } from "@mui/material";
import { MuiTableBody } from "./MuiTableBody";

import { DataTablePagination } from "./data-table-pagination";
import { DataTableToolbar } from "./data-table-toolbar";
import { PanelTopClose, PanelTopOpen } from "lucide-react";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
}

export function TasksDataTable<TData, TValue>({
  columns,
  data,
}: DataTableProps<TData, TValue>) {
  const [rowSelection, setRowSelection] = React.useState({});
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [sorting, setSorting] = React.useState<SortingState>([]);

  const [hide, setHide] = React.useState(false);

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnVisibility,
      rowSelection,
      columnFilters,
    },
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
  });

  return (
    <Stack spacing={2}>
      <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
        <Box>
          {hide ? (
            <IconButton onClick={() => setHide(false)} aria-label="Show tasks"><PanelTopOpen /></IconButton>
          ) : (
            <IconButton onClick={() => setHide(true)} aria-label="Hide tasks"><PanelTopClose /></IconButton>
          )}
        </Box>
      </Box>

      {hide ? (
        <Typography color="text.secondary">This content is hidden now. Use the show tasks button to reveal it.</Typography>
      ) : (
        <>
          <DataTableToolbar table={table} />
          <MuiTableBody table={table} columnCount={columns.length} />
          <DataTablePagination table={table} />
        </>
      )}
    </Stack>
  );
}
