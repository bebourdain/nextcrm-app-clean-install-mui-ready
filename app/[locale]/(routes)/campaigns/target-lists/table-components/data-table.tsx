"use client";

import * as React from "react";
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";

import { Box, IconButton, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from "@mui/material";
import { DataTablePagination } from "./data-table-pagination";
import { DataTableToolbar } from "./data-table-toolbar";
import { PanelTopClose, PanelTopOpen } from "lucide-react";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
}

export function TargetListsDataTable<TData, TValue>({
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

  return <Stack spacing={2} sx={{ width: "100%" }}>
    <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
      <IconButton size="small" aria-label={hide ? "Show table content" : "Hide table content"} onClick={() => setHide(!hide)}>
        {hide ? <PanelTopOpen size={18} /> : <PanelTopClose size={18} />}
      </IconButton>
    </Box>
    {hide ? <Typography variant="body2">This content is hidden now. Use the icon above to show content.</Typography> : <>
      <DataTableToolbar table={table} />
      <TableContainer sx={{ border: 1, borderColor: "divider", borderRadius: "var(--radius)" }}>
        <Table data-testid="target-lists-table" size="small">
          <TableHead>{table.getHeaderGroups().map((group) => <TableRow key={group.id}>{group.headers.map((header) =>
            <TableCell key={header.id} sx={{ whiteSpace: "nowrap", color: "text.secondary" }}>{header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}</TableCell>
          )}</TableRow>)}</TableHead>
          <TableBody>{table.getRowModel().rows.length ? table.getRowModel().rows.map((row) =>
            <TableRow key={row.id} selected={row.getIsSelected()} hover>{row.getVisibleCells().map((cell) =>
              <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
            )}</TableRow>
          ) : <TableRow><TableCell colSpan={table.getVisibleLeafColumns().length} align="center" sx={{ py: 5 }}>No results.</TableCell></TableRow>}</TableBody>
        </Table>
      </TableContainer>
      <DataTablePagination table={table} />
    </>}
  </Stack>;
}
