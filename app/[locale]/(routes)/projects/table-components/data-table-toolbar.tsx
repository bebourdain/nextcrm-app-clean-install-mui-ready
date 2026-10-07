"use client";

import { Cross2Icon } from "@radix-ui/react-icons";
import { Table } from "@tanstack/react-table";

import { Button, Stack, TextField } from "@mui/material";
import { DataTableViewOptions } from "./data-table-view-options";

import { visibility } from "../data/data";
import { DataTableFacetedFilter } from "./data-table-faceted-filter";
import { useTranslations } from "next-intl";

interface DataTableToolbarProps<TData> {
  table: Table<TData>;
}

export function DataTableToolbar<TData>({
  table,
}: DataTableToolbarProps<TData>) {
  const isFiltered = table.getState().columnFilters.length > 0;
  const t = useTranslations("ProjectsPage");

  return (
    <Stack direction={{ xs: "column", md: "row" }} spacing={2} sx={{ justifyContent: "space-between", alignItems: "center" }}>
      <Stack direction="row" spacing={1} sx={{ alignItems: "center", flexWrap: "wrap", gap: 1 }}>
        <TextField
          size="small"
          placeholder={t("dataTable.filterPlaceholder")}
          value={(table.getColumn("title")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("title")?.setFilterValue(event.target.value)
          }
          sx={{ width: 250 }}
        />
        {table.getColumn("visibility") && (
          <DataTableFacetedFilter
            column={table.getColumn("visibility")}
            title={t("dataTable.visibility")}
            options={visibility}
          />
        )}
        {/*         {table.getColumn("priority") && (
          <DataTableFacetedFilter
            column={table.getColumn("priority")}
            title="Priority"
            options={priorities}
          />
        )} */}
        {isFiltered && (
          <Button
            variant="text"
            onClick={() => table.resetColumnFilters()}
          >
            {t("dataTable.reset")}
            <Cross2Icon className="ml-2 h-4 w-4" />
          </Button>
        )}
      </Stack>
      <DataTableViewOptions table={table} />
    </Stack>
  );
}
