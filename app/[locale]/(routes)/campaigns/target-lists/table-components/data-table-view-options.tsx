"use client";

import { useState } from "react";
import { MixerHorizontalIcon } from "@radix-ui/react-icons";
import { Table } from "@tanstack/react-table";
import { Button, Checkbox, ListItemText, Menu, MenuItem, Typography } from "@mui/material";

export function DataTableViewOptions<TData>({ table }: { table: Table<TData> }) {
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);
  return <>
    <Button variant="outlined" size="small" startIcon={<MixerHorizontalIcon />} onClick={(event) => setAnchor(event.currentTarget)}>View</Button>
    <Menu anchorEl={anchor} open={!!anchor} onClose={() => setAnchor(null)}>
      <Typography variant="caption" sx={{ px: 2, color: "text.secondary" }}>Toggle columns</Typography>
      {table.getAllColumns().filter((column) => column.accessorFn !== undefined && column.getCanHide()).map((column) =>
        <MenuItem key={column.id} onClick={() => column.toggleVisibility(!column.getIsVisible())}>
          <Checkbox size="small" checked={column.getIsVisible()} /><ListItemText primary={column.id} sx={{ textTransform: "capitalize" }} />
        </MenuItem>
      )}
    </Menu>
  </>;
}
