"use client";

import { useState } from "react";
import { ArrowDownIcon, ArrowUpIcon, CaretSortIcon, EyeNoneIcon } from "@radix-ui/react-icons";
import { Column } from "@tanstack/react-table";
import { Button, Menu, MenuItem, Typography } from "@mui/material";

export function DataTableColumnHeader<TData, TValue>({ column, title }: { column: Column<TData, TValue>; title: string }) {
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);
  if (!column.getCanSort()) return <Typography variant="body2">{title}</Typography>;
  return <>
    <Button size="small" color="inherit" onClick={(event) => setAnchor(event.currentTarget)} sx={{ minWidth: 0, ml: -1.5, textTransform: "none" }}
      endIcon={column.getIsSorted() === "desc" ? <ArrowDownIcon /> : column.getIsSorted() === "asc" ? <ArrowUpIcon /> : <CaretSortIcon />}>
      {title}
    </Button>
    <Menu anchorEl={anchor} open={!!anchor} onClose={() => setAnchor(null)}>
      <MenuItem onClick={() => { column.toggleSorting(false); setAnchor(null); }}><ArrowUpIcon style={{ marginRight: 8 }} /> Asc</MenuItem>
      <MenuItem onClick={() => { column.toggleSorting(true); setAnchor(null); }}><ArrowDownIcon style={{ marginRight: 8 }} /> Desc</MenuItem>
      <MenuItem onClick={() => { column.toggleVisibility(false); setAnchor(null); }}><EyeNoneIcon style={{ marginRight: 8 }} /> Hide</MenuItem>
    </Menu>
  </>;
}
