"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { DeleteOutlined, MoreHoriz } from "@mui/icons-material";
import { Button, Chip, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, IconButton, Menu, MenuItem, Paper, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TablePagination, TableRow, TableSortLabel, TextField, Typography } from "@mui/material";
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
  const [type, setType] = useState("");
  const [status, setStatus] = useState("");
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
    (!type || product.type === type) && (!status || product.status === status)
  ).sort((a, b) => {
    const av = valueOf(a, sortKey), bv = valueOf(b, sortKey);
    const comparison = typeof av === "number" && typeof bv === "number" ? av - bv : String(av).localeCompare(String(bv));
    return sortDirection === "asc" ? comparison : -comparison;
  }), [data, query, type, status, sortKey, sortDirection]);

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
      <TextField select size="small" label="Type" value={type} onChange={(event) => { setType(event.target.value); setPage(0); }} sx={{ minWidth: 150 }}>
        <MenuItem value="">All types</MenuItem><MenuItem value="PRODUCT">Product</MenuItem><MenuItem value="SERVICE">Service</MenuItem>
      </TextField>
      <TextField select size="small" label="Status" value={status} onChange={(event) => { setStatus(event.target.value); setPage(0); }} sx={{ minWidth: 150 }}>
        <MenuItem value="">All statuses</MenuItem><MenuItem value="DRAFT">Draft</MenuItem><MenuItem value="ACTIVE">Active</MenuItem><MenuItem value="ARCHIVED">Archived</MenuItem>
      </TextField>
      {(query || type || status) && <Button onClick={() => { setQuery(""); setType(""); setStatus(""); setPage(0); }}>Reset</Button>}
    </Stack>
    <TableContainer component={Paper} variant="outlined">
      <Table size="small">
        <TableHead><TableRow>
          {columns.map((column) => <TableCell key={column.key} align={column.align} sortDirection={sortKey === column.key ? sortDirection : false}>
            <TableSortLabel active={sortKey === column.key} direction={sortKey === column.key ? sortDirection : "asc"} onClick={() => sort(column.key)}>{column.label}</TableSortLabel>
          </TableCell>)}
          <TableCell align="right">Actions</TableCell>
        </TableRow></TableHead>
        <TableBody>
          {filtered.slice(page * rowsPerPage, (page + 1) * rowsPerPage).map((product) => <TableRow key={product.id} hover>
            <TableCell><Typography component={Link} href={`/crm/products/${product.id}`} sx={{ color: "primary.main", fontWeight: 600, textDecoration: "none", "&:hover": { textDecoration: "underline" } }}>{product.name}</Typography></TableCell>
            <TableCell>{product.sku || "—"}</TableCell>
            <TableCell><Chip size="small" variant="outlined" color={product.type === "PRODUCT" ? "primary" : "secondary"} label={product.type === "PRODUCT" ? "Product" : "Service"} /></TableCell>
            <TableCell><Chip size="small" color={product.status === "ACTIVE" ? "success" : product.status === "ARCHIVED" ? "warning" : "default"} label={product.status.charAt(0) + product.status.slice(1).toLowerCase()} /></TableCell>
            <TableCell align="right">{formatPrice(product.unit_price, product.currency)}</TableCell>
            <TableCell>{product.category?.name || "—"}</TableCell>
            <TableCell align="right">{product._count.accountProducts}</TableCell>
            <TableCell align="right"><IconButton aria-label={`Actions for ${product.name}`} onClick={(event) => { setSelected(product); setMenuAnchor(event.currentTarget); }}><MoreHoriz /></IconButton></TableCell>
          </TableRow>)}
          {filtered.length === 0 && <TableRow><TableCell colSpan={8} align="center" sx={{ py: 5 }}><Typography color="text.secondary">No results.</Typography></TableCell></TableRow>}
        </TableBody>
      </Table>
      <TablePagination component="div" count={filtered.length} page={Math.min(page, Math.max(0, Math.ceil(filtered.length / rowsPerPage) - 1))} rowsPerPage={rowsPerPage} onPageChange={(_, next) => setPage(next)} onRowsPerPageChange={(event) => { setRowsPerPage(Number(event.target.value)); setPage(0); }} rowsPerPageOptions={[10, 25, 50]} />
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
