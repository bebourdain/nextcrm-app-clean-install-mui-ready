import { Box, IconButton, MenuItem, Select, Stack, Typography } from "@mui/material";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import type { Table } from "@tanstack/react-table";

export function DataTablePagination<TData>({ table }: { table: Table<TData> }) {
  const pageCount = table.getPageCount();
  return <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 2, px: 1, flexWrap: "wrap" }}>
    <Typography variant="body2" color="text.secondary">{table.getFilteredSelectedRowModel().rows.length} of {table.getFilteredRowModel().rows.length} row(s) selected.</Typography>
    <Stack direction="row" spacing={2} sx={{ alignItems: "center", flexWrap: "wrap" }}>
      <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
        <Typography variant="body2">Rows per page</Typography>
        <Select size="small" value={table.getState().pagination.pageSize} onChange={(event) => table.setPageSize(Number(event.target.value))} sx={{ width: 70 }}>
          {[10, 20, 30, 40, 50].map((pageSize) => <MenuItem key={pageSize} value={pageSize}>{pageSize}</MenuItem>)}
        </Select>
      </Stack>
      <Typography variant="body2">Page {table.getState().pagination.pageIndex + 1} of {pageCount}</Typography>
      <Stack direction="row" spacing={0.5}>
        <IconButton aria-label="Go to first page" size="small" disabled={!table.getCanPreviousPage()} onClick={() => table.setPageIndex(0)} sx={{ display: { xs: "none", lg: "inline-flex" } }}><ChevronsLeft size={18} /></IconButton>
        <IconButton aria-label="Go to previous page" size="small" disabled={!table.getCanPreviousPage()} onClick={() => table.previousPage()}><ChevronLeft size={18} /></IconButton>
        <IconButton aria-label="Go to next page" size="small" disabled={!table.getCanNextPage()} onClick={() => table.nextPage()}><ChevronRight size={18} /></IconButton>
        <IconButton aria-label="Go to last page" size="small" disabled={!table.getCanNextPage()} onClick={() => table.setPageIndex(pageCount - 1)} sx={{ display: { xs: "none", lg: "inline-flex" } }}><ChevronsRight size={18} /></IconButton>
      </Stack>
    </Stack>
  </Box>;
}
