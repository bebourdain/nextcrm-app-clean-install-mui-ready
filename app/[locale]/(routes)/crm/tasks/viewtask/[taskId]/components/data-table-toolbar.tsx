"use client";

import { X } from "lucide-react";
import { Table } from "@tanstack/react-table";
import { Box, Button, TextField } from "@mui/material";
import { DataTableViewOptions } from "./data-table-view-options";

interface DataTableToolbarProps<TData> {
  table: Table<TData>;
}

export function DataTableToolbar<TData>({
  table,
}: DataTableToolbarProps<TData>) {
  const isFiltered = table.getState().columnFilters.length > 0;

  return (
    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 1, flexWrap: "wrap" }}>
      <Box sx={{ display: "flex", flex: 1, alignItems: "center", gap: 1 }}>
        <TextField size="small"
          placeholder="Document name ..."
          value={
            (table.getColumn("document_name")?.getFilterValue() as string) ?? ""
          }
          onChange={(event) =>
            table.getColumn("document_name")?.setFilterValue(event.target.value)
          }
          sx={{ width: { xs: 170, lg: 350 } }}
        />
        {isFiltered && (
          <Button variant="text" size="small" onClick={() => table.resetColumnFilters()} endIcon={<X size={16} />}>
            Reset
          </Button>
        )}
      </Box>
      <DataTableViewOptions table={table} />
    </Box>
  );
}
