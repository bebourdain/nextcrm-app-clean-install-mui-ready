"use client";

import { Table } from "@tanstack/react-table";
import { Button, Stack, TextField } from "@mui/material";
import { DataTableViewOptions } from "./data-table-view-options";
import { DataTableFacetedFilter } from "./data-table-faceted-filter";
import { priorities, statuses } from "../data/data";

export function DataTableToolbar<TData>({ table }: { table: Table<TData> }) {
  const filtered = table.getState().columnFilters.length > 0;
  return <Stack direction={{ xs: "column", md: "row" }} spacing={2} sx={{ alignItems: "center", justifyContent: "space-between" }}><Stack direction="row" spacing={1} sx={{ alignItems: "center", flexWrap: "wrap", gap: 1 }}><TextField size="small" placeholder="Filter tasks..." value={(table.getColumn("title")?.getFilterValue() as string) ?? ""} onChange={(event) => table.getColumn("title")?.setFilterValue(event.target.value)} sx={{ width: 250 }} />{table.getColumn("taskStatus") && <DataTableFacetedFilter column={table.getColumn("taskStatus")} title="Status" options={statuses} />}{table.getColumn("priority") && <DataTableFacetedFilter column={table.getColumn("priority")} title="Priority" options={priorities} />}{filtered && <Button size="small" onClick={() => table.resetColumnFilters()}>Reset</Button>}</Stack><DataTableViewOptions table={table} /></Stack>;
}
