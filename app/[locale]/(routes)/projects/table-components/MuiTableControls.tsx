"use client";

import * as React from "react";
import { Column, Table } from "@tanstack/react-table";
import { Box, Button, Checkbox, Chip, FormControl, InputLabel, ListItemText, Menu, MenuItem, Select, Stack, Typography } from "@mui/material";
import { ChevronDown, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";

export function TableColumnHeader<TData, TValue>({ column, title }: { column: Column<TData, TValue>; title: string }) {
  if (!column.getCanSort()) return <Typography variant="body2" sx={{ fontWeight: 600 }}>{title}</Typography>;
  return <Button size="small" color="inherit" endIcon={<ChevronDown size={14} />} onClick={() => column.toggleSorting(column.getIsSorted() === "asc")} sx={{ fontWeight: 600, textTransform: "none" }}>{title}{column.getIsSorted() === "asc" ? " ↑" : column.getIsSorted() === "desc" ? " ↓" : ""}</Button>;
}

export function TableFacetedFilter<TData, TValue>({ column, title, options }: { column?: Column<TData, TValue>; title?: string; options: { label: string; value: string; icon?: React.ComponentType<{ className?: string }> }[] }) {
  const selectedValues = new Set((column?.getFilterValue() as string[]) ?? []);
  return <FormControl size="small" sx={{ minWidth: 130, maxWidth: 260 }}><InputLabel>{title}</InputLabel><Select multiple label={title} value={Array.from(selectedValues)} renderValue={(selected) => <Stack direction="row" spacing={0.5}>{selected.map((value) => <Chip key={value} size="small" label={options.find((option) => option.value === value)?.label ?? value} />)}</Stack>} onChange={(event) => { const values = typeof event.target.value === "string" ? event.target.value.split(",") : event.target.value; column?.setFilterValue(values.length ? values : undefined); }}>{options.map((option) => <MenuItem key={option.value} value={option.value}><Checkbox size="small" checked={selectedValues.has(option.value)} /><ListItemText primary={option.label} /></MenuItem>)}</Select></FormControl>;
}

export function TableViewOptions<TData>({ table }: { table: Table<TData> }) {
  const [anchor, setAnchor] = React.useState<HTMLElement | null>(null);
  return <><Button variant="outlined" size="small" onClick={(event) => setAnchor(event.currentTarget)}>View</Button><Menu anchorEl={anchor} open={!!anchor} onClose={() => setAnchor(null)}><Typography variant="caption" sx={{ px: 2, color: "text.secondary" }}>Toggle columns</Typography>{table.getAllColumns().filter((column) => column.accessorFn !== undefined && column.getCanHide()).map((column) => <MenuItem key={column.id} onClick={() => column.toggleVisibility(!column.getIsVisible())}><Checkbox size="small" checked={column.getIsVisible()} /><ListItemText primary={column.id} sx={{ textTransform: "capitalize" }} /></MenuItem>)}</Menu></>;
}

export function TablePagination<TData>({ table }: { table: Table<TData> }) {
  return <Stack direction={{ xs: "column", md: "row" }} spacing={2} sx={{ alignItems: "center", justifyContent: "space-between", py: 1 }}><Typography variant="body2" color="text.secondary">{table.getFilteredSelectedRowModel().rows.length} of {table.getFilteredRowModel().rows.length} row(s) selected.</Typography><Stack direction="row" spacing={1} sx={{ alignItems: "center" }}><Typography variant="body2">Rows per page</Typography><Select size="small" value={table.getState().pagination.pageSize} onChange={(event) => table.setPageSize(Number(event.target.value))}>{[10, 20, 30, 40, 50].map((size) => <MenuItem key={size} value={size}>{size}</MenuItem>)}</Select><Typography variant="body2">Page {table.getState().pagination.pageIndex + 1} of {Math.max(1, table.getPageCount())}</Typography><Box><Button size="small" onClick={() => table.setPageIndex(0)} disabled={!table.getCanPreviousPage()} aria-label="First page"><ChevronsLeft size={16} /></Button><Button size="small" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()} aria-label="Previous page"><ChevronLeft size={16} /></Button><Button size="small" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()} aria-label="Next page"><ChevronRight size={16} /></Button><Button size="small" onClick={() => table.setPageIndex(table.getPageCount() - 1)} disabled={!table.getCanNextPage()} aria-label="Last page"><ChevronsRight size={16} /></Button></Box></Stack></Stack>;
}
