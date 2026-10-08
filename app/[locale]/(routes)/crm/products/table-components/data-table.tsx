"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { DeleteOutlined, MoreHoriz } from "@mui/icons-material";
import { Button, Checkbox, Chip, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Divider, FormControl, IconButton, InputLabel, ListItemText, Menu, MenuItem, OutlinedInput, Paper, Select, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TablePagination, TableRow, TableSortLabel, TextField, Typography } from "@mui/material";
import { toast } from "sonner";
import { deleteProduct } from "@/actions/crm/products/delete-product";
import type { Product } from "../table-data/schema";

type SortKey = "name" | "sku" | "type" | "status" | "unit_price" | "category" | "accounts";
const columns: { key: SortKey; label: string; align?: "right" }[] = [
  { key: "name", label: "Name" }, { key: "sku", label: "SKU" }, { key: "type", label: "Type" },
  { key: "status", label: "Status" }, { key: "unit_price", label: "Price", align: "right" },
  { key: "category", label: "Category" }, { key: "accounts", label: "Accounts", align: "right" },
];

const valueOf = (product: Product, key: SortKey): string | number => {
  if (key === "category") return product.category?.name ?? "";
  if (key === "accounts") return product._count.accountProducts;
  if (key === "unit_price") return Number(product.unit_price);
  return product[key] ?? "";
};

function formatPrice(value: number, currency: string) {
  try { return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(Number(value)); }
  catch { return `${Number(value).toFixed(2)} ${currency}`; }
}

export function ProductsDataTable({ data }: { data: Product[] }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [types, setTypes] = useState<string[]>([]);
  const [statuses, setStatuses] = useState<string[]>([]);
  const [visible, setVisible] = useState<SortKey[]>(columns.map((column) => column.key));
  const [viewAnchor, setViewAnchor] = useState<HTMLElement | null>(null);
  const [sortKey, setSortKey] = useState<SortKey>("name");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null);
  const [selected, setSelected] = useState<Product | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const filtered = useMemo(() => data.filter((product) =>
    product.name.toLowerCase().includes(query.toLowerCase()) &&
    (!types.length || types.includes(product.type)) && (!statuses.length || statuses.includes(product.status))
  ).sort((a, b) => {
    const av = valueOf(a, sortKey), bv = valueOf(b, sortKey);
    const comparison = typeof av === "number" && typeof bv === "number" ? av - bv : String(av).localeCompare(String(bv));
    return sortDirection === "asc" ? comparison : -comparison;
  }), [data, query, types, statuses, sortKey, sortDirection]);

  const sort = (key: SortKey) => {
    if (sortKey === key) setSortDirection((current) => current === "asc" ? "desc" : "asc");
    else { setSortKey(key); setSortDirection("asc"); }
    setPage(0);
  };

  const onDelete = async () => {
    if (!selected) return;
    setDeleting(true);
    try {
      const result = await deleteProduct(selected.id);
      if (result.error) throw new Error(result.error);
      toast.success("Product has been deleted");
      setDeleteOpen(false);
      setSelected(null);
      router.refresh();
    } catch {
      toast.error("Something went wrong while deleting product. Please try again.");
    } finally { setDeleting(false); }
  };

  return <Stack spacing={2}>
    <Stack direction={{ xs: "column", md: "row" }} spacing={1.5} sx={{ alignItems: { md: "center" } }}>
      <TextField size="small" label="Search products" value={query} onChange={(event) => { setQuery(event.target.value); setPage(0); }} sx={{ minWidth: 230 }} />
      <FormControl size="small" sx={{ minWidth: 150 }}><InputLabel id="products-type-label">Type</InputLabel><Select id="products-type" labelId="products-type-label" multiple value={types} onChange={(event) => { setTypes(typeof event.target.value === "string" ? event.target.value.split(",") : event.target.value); setPage(0); }} input={<OutlinedInput label="Type" />} renderValue={(selected) => selected.map((value) => value === "PRODUCT" ? "Product" : "Service").join(", ")}>
        {[["PRODUCT", "Product"], ["SERVICE", "Service"]].map(([value, label]) => <MenuItem key={value} value={value}><Checkbox size="small" checked={types.includes(value)} /><ListItemText primary={label} /></MenuItem>)}
      </Select></FormControl>
      <FormControl size="small" sx={{ minWidth: 150 }}><InputLabel id="products-status-label">Status</InputLabel><Select id="products-status" labelId="products-status-label" multiple value={statuses} onChange={(event) => { setStatuses(typeof event.target.value === "string" ? event.target.value.split(",") : event.target.value); setPage(0); }} input={<OutlinedInput label="Status" />} renderValue={(selected) => selected.map((value) => value.charAt(0) + value.slice(1).toLowerCase()).join(", ")}>
        {["DRAFT", "ACTIVE", "ARCHIVED"].map((value) => <MenuItem key={value} value={value}><Checkbox size="small" checked={statuses.includes(value)} /><ListItemText primary={value.charAt(0) + value.slice(1).toLowerCase()} /></MenuItem>)}
      </Select></FormControl>
      {(query || types.length || statuses.length) ? <Button onClick={() => { setQuery(""); setTypes([]); setStatuses([]); setPage(0); }}>Reset</Button> : null}
      <Button variant="outlined" onClick={(event) => setViewAnchor(event.currentTarget)} sx={{ ml: { md: "auto" } }}>View</Button>
      <Menu anchorEl={viewAnchor} open={!!viewAnchor} onClose={() => setViewAnchor(null)}><MenuItem disabled>Toggle columns</MenuItem><Divider />{columns.filter((column) => column.key !== "name").map((column) => <MenuItem key={column.key} onClick={() => setVisible((current) => current.includes(column.key) ? current.filter((key) => key !== column.key) : [...current, column.key])}><Checkbox size="small" checked={visible.includes(column.key)} /><ListItemText primary={column.label} /></MenuItem>)}</Menu>
    </Stack>
    <TableContainer component={Paper} variant="outlined">
      <Table size="small">
        <TableHead><TableRow>
          {columns.filter((column) => visible.includes(column.key)).map((column) => <TableCell key={column.key} align={column.align} sortDirection={sortKey === column.key ? sortDirection : false}>
            <TableSortLabel active={sortKey === column.key} direction={sortKey === column.key ? sortDirection : "asc"} onClick={() => sort(column.key)}>{column.label}</TableSortLabel>
          </TableCell>)}
          <TableCell align="right">Actions</TableCell>
        </TableRow></TableHead>
        <TableBody>
          {filtered.slice(page * rowsPerPage, (page + 1) * rowsPerPage).map((product) => <TableRow key={product.id} hover>
            <TableCell><Typography component={Link} href={`/crm/products/${product.id}`} sx={{ color: "primary.main", fontWeight: 600, textDecoration: "none", "&:hover": { textDecoration: "underline" } }}>{product.name}</Typography></TableCell>
            {visible.includes("sku") && <TableCell>{product.sku || "—"}</TableCell>}
            {visible.includes("type") && <TableCell><Chip size="small" variant="outlined" color={product.type === "PRODUCT" ? "primary" : "secondary"} label={product.type === "PRODUCT" ? "Product" : "Service"} /></TableCell>}
            {visible.includes("status") && <TableCell><Chip size="small" color={product.status === "ACTIVE" ? "success" : product.status === "ARCHIVED" ? "warning" : "default"} label={product.status.charAt(0) + product.status.slice(1).toLowerCase()} /></TableCell>}
            {visible.includes("unit_price") && <TableCell align="right">{formatPrice(product.unit_price, product.currency)}</TableCell>}
            {visible.includes("category") && <TableCell>{product.category?.name || "—"}</TableCell>}
            {visible.includes("accounts") && <TableCell align="right">{product._count.accountProducts}</TableCell>}
            <TableCell align="right"><IconButton aria-label={`Actions for ${product.name}`} onClick={(event) => { setSelected(product); setMenuAnchor(event.currentTarget); }}><MoreHoriz /></IconButton></TableCell>
          </TableRow>)}
          {filtered.length === 0 && <TableRow><TableCell colSpan={visible.length + 1} align="center" sx={{ py: 5 }}><Typography color="text.secondary">No results.</Typography></TableCell></TableRow>}
        </TableBody>
      </Table>
      <TablePagination component="div" count={filtered.length} page={Math.min(page, Math.max(0, Math.ceil(filtered.length / rowsPerPage) - 1))} rowsPerPage={rowsPerPage} onPageChange={(_, next) => setPage(next)} onRowsPerPageChange={(event) => { setRowsPerPage(Number(event.target.value)); setPage(0); }} rowsPerPageOptions={[10, 20, 30, 40, 50]} showFirstButton showLastButton />
    </TableContainer>
    <Menu anchorEl={menuAnchor} open={Boolean(menuAnchor)} onClose={() => setMenuAnchor(null)}>
      <MenuItem onClick={() => { setMenuAnchor(null); if (selected) router.push(`/crm/products/${selected.id}`); }}>View / Edit</MenuItem>
      <MenuItem onClick={() => { setMenuAnchor(null); setDeleteOpen(true); }} sx={{ color: "error.main" }}><DeleteOutlined fontSize="small" sx={{ mr: 1 }} />Delete</MenuItem>
    </Menu>
    <Dialog open={deleteOpen} onClose={() => { if (!deleting) setDeleteOpen(false); }}>
      <DialogTitle>Delete product?</DialogTitle>
      <DialogContent><DialogContentText>This will delete {selected?.name}. This action cannot be undone.</DialogContentText></DialogContent>
      <DialogActions><Button onClick={() => setDeleteOpen(false)} disabled={deleting}>Cancel</Button><Button onClick={onDelete} color="error" variant="contained" disabled={deleting}>{deleting ? "Deleting…" : "Delete"}</Button></DialogActions>
    </Dialog>
  </Stack>;
}
