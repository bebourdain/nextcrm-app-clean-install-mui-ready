"use client";

import { flexRender, Table as ReactTable } from "@tanstack/react-table";
import { Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from "@mui/material";

export function MuiTableBody<TData>({ table, columnCount }: { table: ReactTable<TData>; columnCount: number }) {
  return <TableContainer component={Paper} variant="outlined"><Table size="small"><TableHead>{table.getHeaderGroups().map((group) => <TableRow key={group.id}>{group.headers.map((header) => <TableCell key={header.id} sx={{ fontWeight: 600, whiteSpace: "nowrap" }}>{header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}</TableCell>)}</TableRow>)}</TableHead><TableBody>{table.getRowModel().rows.length ? table.getRowModel().rows.map((row) => <TableRow key={row.id} selected={row.getIsSelected()} hover>{row.getVisibleCells().map((cell) => <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>)}</TableRow>) : <TableRow><TableCell colSpan={columnCount} align="center" sx={{ py: 5 }}><Typography color="text.secondary">No results.</Typography></TableCell></TableRow>}</TableBody></Table></TableContainer>;
}
