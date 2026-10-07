"use client";

import { Cross2Icon } from "@radix-ui/react-icons";
import { Table } from "@tanstack/react-table";
import { Box, Button, TextField } from "@mui/material";
import { DataTableViewOptions } from "./data-table-view-options";

export function DataTableToolbar<TData>({ table }: { table: Table<TData> }) {
  const isFiltered = table.getState().columnFilters.length > 0;
  return <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 2 }}>
    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
      <TextField size="small" placeholder="Filter by last name ..." value={(table.getColumn("last_name")?.getFilterValue() as string) ?? ""}
        onChange={(event) => table.getColumn("last_name")?.setFilterValue(event.target.value)} sx={{ width: { xs: 170, sm: 250 } }} />
      {isFiltered && <Button size="small" color="inherit" onClick={() => table.resetColumnFilters()} endIcon={<Cross2Icon />}>Reset</Button>}
    </Box>
    <DataTableViewOptions table={table} />
  </Box>;
}
