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

import { Box, Button, IconButton, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from "@mui/material";
import { DataTablePagination } from "./data-table-pagination";
import { DataTableToolbar } from "./data-table-toolbar";
import { PanelTopClose, PanelTopOpen, Sparkles } from "lucide-react";
import { BulkEnrichTargetsModal } from "../components/BulkEnrichTargetsModal";
import ExportTargetsButton from "@/components/campaigns/ExportTargetsButton";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
}

export function TargetsDataTable<TData, TValue>({
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
  const [bulkEnrichOpen, setBulkEnrichOpen] = React.useState(false);

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
    <Box sx={{ display: "flex", justifyContent: "flex-end", alignItems: "center", gap: 1 }}>
      <ExportTargetsButton getTargets={() => { const selected = table.getSelectedRowModel().rows; const rows = selected.length ? selected : table.getFilteredRowModel().rows; return rows.map((row) => row.original as Record<string, unknown>); }} filenameBase={`targets-${new Date().toISOString().slice(0, 10)}`} />
      <IconButton size="small" aria-label={hide ? "Show table content" : "Hide table content"} onClick={() => setHide(!hide)}>
        {hide ? <PanelTopOpen size={18} /> : <PanelTopClose size={18} />}
      </IconButton>
    </Box>
    {hide ? <Typography variant="body2">This content is hidden now. Use the icon above to show content.</Typography> : <>
      <DataTableToolbar table={table} />
      {table.getSelectedRowModel().rows.length > 0 && <Stack direction="row" spacing={2} sx={{ alignItems: "center", p: 1, bgcolor: "action.hover", borderRadius: 1 }}>
        <Typography variant="body2" color="text.secondary">{table.getSelectedRowModel().rows.length} selected</Typography>
        <Button variant="outlined" size="small" startIcon={<Sparkles size={16} />} onClick={() => setBulkEnrichOpen(true)}>Enrich {table.getSelectedRowModel().rows.length} targets</Button>
      </Stack>}
      <BulkEnrichTargetsModal targetIds={table.getSelectedRowModel().rows.map((row) => (row.original as { id: string }).id)} open={bulkEnrichOpen} onOpenChange={setBulkEnrichOpen} />
      <TableContainer sx={{ border: 1, borderColor: "divider", borderRadius: "var(--radius)" }}>
        <Table data-testid="targets-table" size="small">
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
