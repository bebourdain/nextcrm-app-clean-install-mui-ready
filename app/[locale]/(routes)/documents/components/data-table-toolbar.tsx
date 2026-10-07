"use client";

import { useState } from "react";
import { Table } from "@tanstack/react-table";
import { Button, Stack, TextField, ToggleButton, ToggleButtonGroup } from "@mui/material";
import { DataTableViewOptions } from "./data-table-view-options";
import { DataTableFacetedFilter } from "./data-table-faceted-filter";
import { documentSystemTypes, processingStatuses } from "../data/data";
import { useTranslations } from "next-intl";

export function DataTableToolbar<TData>({ table }: { table: Table<TData> }) {
  const isFiltered = table.getState().columnFilters.length > 0;
  const t = useTranslations("DocumentsPage");
  const [searchMode, setSearchMode] = useState<"name" | "content">("name");
  function changeMode(mode: "name" | "content" | null) {
    if (!mode || mode === searchMode) return;
    setSearchMode(mode);
    if (mode === "name") table.setGlobalFilter("");
    else table.getColumn("document_name")?.setFilterValue("");
  }
  return <Stack direction={{ xs: "column", lg: "row" }} spacing={2} sx={{ alignItems: { xs: "stretch", lg: "center" }, justifyContent: "space-between" }}><Stack direction="row" spacing={1} sx={{ alignItems: "center", flexWrap: "wrap", gap: 1 }}><ToggleButtonGroup size="small" exclusive value={searchMode} onChange={(_, mode) => changeMode(mode)} aria-label="Search mode"><ToggleButton value="name">Name</ToggleButton><ToggleButton value="content">Content</ToggleButton></ToggleButtonGroup>{searchMode === "name" ? <TextField size="small" placeholder={t("dataTable.filterPlaceholder")} value={(table.getColumn("document_name")?.getFilterValue() as string) ?? ""} onChange={(event) => table.getColumn("document_name")?.setFilterValue(event.target.value)} sx={{ width: 250 }} /> : <TextField size="small" placeholder="Search in names & summaries..." value={(table.getState().globalFilter as string) ?? ""} onChange={(event) => table.setGlobalFilter(event.target.value)} sx={{ width: 250 }} />}{table.getColumn("document_system_type") && <DataTableFacetedFilter column={table.getColumn("document_system_type")} title="Type" options={documentSystemTypes} />}{table.getColumn("processing_status") && <DataTableFacetedFilter column={table.getColumn("processing_status")} title="Status" options={processingStatuses} />}{isFiltered && <Button size="small" onClick={() => table.resetColumnFilters()}>{t("dataTable.reset")}</Button>}</Stack><DataTableViewOptions table={table} /></Stack>;
}
