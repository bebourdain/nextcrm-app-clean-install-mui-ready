"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button, Chip, Divider, Paper, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from "@mui/material";
import AssignProductForm from "./AssignProductForm";
import { removeAssignment } from "@/actions/crm/account-products/remove-assignment";
import type { getAllCrmData } from "@/actions/crm/get-crm-data";

type CrmData = Awaited<ReturnType<typeof getAllCrmData>>;
type ProductAssignment = { id: string; productId: string; product?: { id?: string; name?: string; type?: string; unit_price?: unknown; currency?: string } | null; custom_price?: unknown; currency?: string | null; status: string; quantity?: number; start_date?: Date | string | null; end_date?: Date | string | null };

export default function AccountProductsView({ data, accountId, crmData, activeProducts }: { data: ProductAssignment[]; accountId: string; crmData: CrmData; activeProducts: { id: string; name: string; currency: string }[] }) {
  const router = useRouter();
  const handleCancel = async (id: string) => {
    const result = await removeAssignment(id);
    if (result?.error) toast.error(result.error);
    else { toast.success("Assignment cancelled"); router.refresh(); }
  };
  const formatPrice = (item: ProductAssignment) => {
    const price = item.custom_price ?? item.product?.unit_price;
    if (price == null) return "—";
    return `${Number(price).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${item.currency || item.product?.currency || "EUR"}`;
  };
  const formatDate = (date?: Date | string | null) => date ? new Date(date).toLocaleDateString() : "—";
  return <Paper variant="outlined" sx={{ p: 3, borderRadius: "var(--radius)" }}>
    <Stack direction="row" sx={{ alignItems: "center", justifyContent: "space-between" }}>
      <Typography variant="h6" sx={{ fontWeight: 600 }}><Link href="/crm/products">Products</Link></Typography>
      <AssignProductForm accountId={accountId} products={activeProducts} currencies={crmData.currencies.map((currency) => ({ code: currency.code, name: currency.name, symbol: currency.symbol }))} />
    </Stack>
    <Divider sx={{ my: 2 }} />
    {!data.length ? <Typography variant="body2">No products assigned to this account</Typography> : <TableContainer><Table size="small"><TableHead><TableRow>{["Product", "Type", "Status", "Qty", "Price", "Start", "End", ""].map((label, index) => <TableCell key={index}>{label}</TableCell>)}</TableRow></TableHead><TableBody>{data.map((item) => <TableRow key={item.id}>
      <TableCell><Button component={Link} href={`/crm/products/${item.product?.id || item.productId}`} color="inherit" sx={{ textTransform: "none" }}>{item.product?.name || "Unknown"}</Button></TableCell>
      <TableCell>{item.product?.type || "—"}</TableCell>
      <TableCell><Chip size="small" variant="outlined" label={item.status} color={item.status === "ACTIVE" ? "success" : item.status === "PENDING" ? "warning" : item.status === "CANCELLED" ? "error" : "default"} /></TableCell>
      <TableCell>{item.quantity}</TableCell><TableCell>{formatPrice(item)}</TableCell><TableCell>{formatDate(item.start_date)}</TableCell><TableCell>{formatDate(item.end_date)}</TableCell>
      <TableCell>{(item.status === "ACTIVE" || item.status === "PENDING") && <Button size="small" color="error" onClick={() => handleCancel(item.id)}>Cancel</Button>}</TableCell>
    </TableRow>)}</TableBody></Table></TableContainer>}
  </Paper>;
}
