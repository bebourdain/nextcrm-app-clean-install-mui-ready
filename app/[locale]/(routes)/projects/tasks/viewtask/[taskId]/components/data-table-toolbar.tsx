"use client";

import { Cross2Icon } from "@radix-ui/react-icons";
import { Table } from "@tanstack/react-table";

import { Button, Stack, TextField } from "@mui/material";
import { DataTableViewOptions } from "./data-table-view-options";

import { priorities, statuses } from "../data/data";
import { DataTableFacetedFilter } from "./data-table-faceted-filter";

interface DataTableToolbarProps<TData> {
  table: Table<TData>;
}

export function DataTableToolbar<TData>({
  table,
}: DataTableToolbarProps<TData>) {
  const isFiltered = table.getState().columnFilters.length > 0;

  return (
    <Stack direction={{ xs: "column", md: "row" }} spacing={2} sx={{ justifyContent: "space-between", alignItems: "center" }}>
      <Stack direction="row" spacing={1} sx={{ alignItems: "center", flexWrap: "wrap", gap: 1 }}>
        <TextField
          size="small"
          placeholder="Document name ..."
          value={
            (table.getColumn("document_name")?.getFilterValue() as string) ?? ""
          }
          onChange={(event) =>
            table.getColumn("document_name")?.setFilterValue(event.target.value)
          }
          sx={{ width: 350 }}
        />
        {table.getColumn("taskStatus") && (
          <DataTableFacetedFilter
            column={table.getColumn("taskStatus")}
            title="Status"
            options={statuses}
          />
        )}
        {table.getColumn("priority") && (
          <DataTableFacetedFilter
            column={table.getColumn("priority")}
            title="Priority"
            options={priorities}
          />
        )}
        {isFiltered && (
          <Button
            variant="text"
            onClick={() => table.resetColumnFilters()}
          >
            Reset
            <Cross2Icon className="ml-2 h-4 w-4" />
          </Button>
        )}
      </Stack>
      <DataTableViewOptions table={table} />
    </Stack>
  );
}
