"use client";

import { useState, type ComponentType } from "react";
import { Box, Button, Checkbox, Divider, ListItemText, Menu, MenuItem, TextField, Typography } from "@mui/material";
import { PlusCircle } from "lucide-react";
import type { Column } from "@tanstack/react-table";

type FilterOption = { label: string; value: string; icon?: ComponentType<{ className?: string }> };

export function DataTableFacetedFilter<TData, TValue>({ column, title, options }: { column?: Column<TData, TValue>; title?: string; options: FilterOption[] }) {
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);
  const [search, setSearch] = useState("");
  const facets = column?.getFacetedUniqueValues();
  const selectedValues = new Set((column?.getFilterValue() as string[] | undefined) ?? []);
  const filteredOptions = options.filter((option) => option.label.toLowerCase().includes(search.toLowerCase()));
  const toggle = (value: string) => {
    const next = new Set(selectedValues);
    if (next.has(value)) next.delete(value); else next.add(value);
    column?.setFilterValue(next.size ? Array.from(next) : undefined);
  };
  return <>
    <Button variant="outlined" size="small" startIcon={<PlusCircle size={16} />} onClick={(event) => setAnchor(event.currentTarget)} sx={{ borderStyle: "dashed" }}>{title}{selectedValues.size > 0 ? ` · ${selectedValues.size} selected` : ""}</Button>
    <Menu anchorEl={anchor} open={Boolean(anchor)} onClose={() => setAnchor(null)} slotProps={{ paper: { sx: { width: 240, maxHeight: 360 } } }}>
      <Box sx={{ px: 1, py: 0.5 }}><TextField size="small" fullWidth placeholder={title} value={search} onChange={(event) => setSearch(event.target.value)} /></Box>
      {filteredOptions.length === 0 && <Typography variant="body2" color="text.secondary" sx={{ p: 2 }}>No results found.</Typography>}
      {filteredOptions.map((option) => <MenuItem key={option.value} onClick={() => toggle(option.value)}>
        <Checkbox size="small" checked={selectedValues.has(option.value)} sx={{ p: 0.5, mr: 1 }} />
        {option.icon && <option.icon />}
        <ListItemText primary={option.label} sx={{ ml: option.icon ? 1 : 0 }} />
        {facets?.get(option.value) ? <Typography variant="caption" color="text.secondary">{facets.get(option.value)}</Typography> : null}
      </MenuItem>)}
      {selectedValues.size > 0 && <><Divider /><MenuItem onClick={() => column?.setFilterValue(undefined)}>Clear filters</MenuItem></>}
    </Menu>
  </>;
}
