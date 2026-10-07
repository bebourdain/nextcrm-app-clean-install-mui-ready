import { Table } from "@tanstack/react-table";
import { Box, IconButton, MenuItem, Select, Stack, Typography } from "@mui/material";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";

export function DataTablePagination<TData>({ table }: { table: Table<TData> }) {
  return <Stack direction={{ xs: "column", md: "row" }} spacing={2} sx={{ alignItems: "center", justifyContent: "space-between" }}>
    <Typography variant="body2" color="text.secondary">{table.getFilteredSelectedRowModel().rows.length} of {table.getFilteredRowModel().rows.length} row(s) selected.</Typography>
    <Stack direction="row" spacing={2} sx={{ alignItems: "center" }}>
      <Typography variant="body2">Rows per page</Typography>
      <Select size="small" value={table.getState().pagination.pageSize} onChange={(event) => table.setPageSize(Number(event.target.value))}>
        {[10, 20, 30, 40, 50].map((size) => <MenuItem key={size} value={size}>{size}</MenuItem>)}
      </Select>
      <Typography variant="body2" sx={{ whiteSpace: "nowrap" }}>Page {table.getState().pagination.pageIndex + 1} of {Math.max(1, table.getPageCount())}</Typography>
      <Box sx={{ display: "flex" }}>
        <IconButton size="small" aria-label="Go to first page" onClick={() => table.setPageIndex(0)} disabled={!table.getCanPreviousPage()}><ChevronsLeft size={18} /></IconButton>
        <IconButton size="small" aria-label="Go to previous page" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}><ChevronLeft size={18} /></IconButton>
        <IconButton size="small" aria-label="Go to next page" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}><ChevronRight size={18} /></IconButton>
        <IconButton size="small" aria-label="Go to last page" onClick={() => table.setPageIndex(table.getPageCount() - 1)} disabled={!table.getCanNextPage()}><ChevronsRight size={18} /></IconButton>
      </Box>
    </Stack>
  </Stack>;
}
