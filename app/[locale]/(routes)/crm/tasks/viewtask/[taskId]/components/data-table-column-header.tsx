"use client";

import { useState } from "react";
import { Button, Divider, Menu, MenuItem, Typography } from "@mui/material";
import { ArrowDown, ArrowUp, ChevronsUpDown, EyeOff } from "lucide-react";
import type { Column } from "@tanstack/react-table";

export function DataTableColumnHeader<TData, TValue>({ column, title }: { column: Column<TData, TValue>; title: string }) {
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);
  if (!column.getCanSort()) return <Typography variant="body2" sx={{ fontWeight: 600 }}>{title}</Typography>;
  return <>
    <Button size="small" variant="text" onClick={(event) => setAnchor(event.currentTarget)} endIcon={column.getIsSorted() === "desc" ? <ArrowDown size={15} /> : column.getIsSorted() === "asc" ? <ArrowUp size={15} /> : <ChevronsUpDown size={15} />} sx={{ color: "text.secondary", p: 0.5, textTransform: "none" }}>{title}</Button>
    <Menu anchorEl={anchor} open={Boolean(anchor)} onClose={() => setAnchor(null)}>
      <MenuItem onClick={() => { column.toggleSorting(false); setAnchor(null); }}><ArrowUp size={15} style={{ marginRight: 10 }} />Asc</MenuItem>
      <MenuItem onClick={() => { column.toggleSorting(true); setAnchor(null); }}><ArrowDown size={15} style={{ marginRight: 10 }} />Desc</MenuItem>
      <Divider />
      <MenuItem onClick={() => { column.toggleVisibility(false); setAnchor(null); }}><EyeOff size={15} style={{ marginRight: 10 }} />Hide</MenuItem>
    </Menu>
  </>;
}
