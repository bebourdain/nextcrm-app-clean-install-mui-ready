"use client";

import { useState } from "react";
import { Button, Checkbox, Divider, ListItemText, Menu, MenuItem } from "@mui/material";
import { SlidersHorizontal } from "lucide-react";
import type { Table } from "@tanstack/react-table";

export function DataTableViewOptions<TData>({ table }: { table: Table<TData> }) {
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);
  return <>
    <Button variant="outlined" size="small" startIcon={<SlidersHorizontal size={16} />} onClick={(event) => setAnchor(event.currentTarget)}>View</Button>
    <Menu anchorEl={anchor} open={Boolean(anchor)} onClose={() => setAnchor(null)}>
      <MenuItem disabled>Toggle columns</MenuItem><Divider />
      {table.getAllColumns().filter((column) => typeof column.accessorFn !== "undefined" && column.getCanHide()).map((column) =>
        <MenuItem key={column.id} onClick={() => column.toggleVisibility(!column.getIsVisible())}>
          <Checkbox size="small" checked={column.getIsVisible()} sx={{ p: 0.5, mr: 1 }} />
          <ListItemText primary={column.id} slotProps={{ primary: { sx: { textTransform: "capitalize" } } }} />
        </MenuItem>)}
    </Menu>
  </>;
}
