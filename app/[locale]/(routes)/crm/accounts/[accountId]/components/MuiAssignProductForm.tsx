"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { Box, Button, Divider, Drawer, MenuItem, Stack, TextField, Typography } from "@mui/material";
import { toast } from "sonner";
import { useAction } from "@/hooks/use-action";
import { assignProduct } from "@/actions/crm/account-products/assign-product";

type Props = {
  accountId: string;
  products: { id: string; name: string; currency: string }[];
  currencies: { code: string; name: string; symbol: string }[];
};

export default function MuiAssignProductForm({ accountId, products, currencies }: Props) {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const { execute, fieldErrors, isLoading } = useAction(assignProduct, {
    onSuccess: () => { toast.success("Product assigned successfully"); setOpen(false); router.refresh(); },
    onError: (error) => toast.error(error),
  });
  async function onAction(formData: FormData) {
    const productId = formData.get("productId") as string;
    const quantity = parseInt((formData.get("quantity") as string) || "1", 10);
    const custom_price = (formData.get("custom_price") as string) || undefined;
    const currency = formData.get("currency") as string;
    const status = (formData.get("status") as "ACTIVE" | "PENDING") || "ACTIVE";
    const start_date = new Date(formData.get("start_date") as string);
    const end_date_raw = formData.get("end_date") as string;
    const end_date = end_date_raw ? new Date(end_date_raw) : undefined;
    const renewal_date_raw = formData.get("renewal_date") as string;
    const renewal_date = renewal_date_raw ? new Date(renewal_date_raw) : undefined;
    const notes = (formData.get("notes") as string) || undefined;
    await execute({ accountId, productId, quantity, custom_price, currency, status, start_date, end_date, renewal_date, notes });
  }
  const error = (field: string) => fieldErrors?.[field as keyof typeof fieldErrors]?.join(", ") ?? "";
  return <><Button variant="contained" size="small" aria-label="Assign Product" onClick={() => setOpen(true)}>+</Button><Drawer anchor="right" open={open} onClose={() => setOpen(false)} slotProps={{ paper: { sx: { width: { xs: "100%", sm: 540 }, maxWidth: "100%" } } }}><Box sx={{ p: 3, overflowY: "auto" }}><Typography variant="h5">Assign Product</Typography><Typography variant="body2" color="text.secondary">Assign a product or service to this account</Typography><Divider sx={{ my: 2 }} /><form action={onAction}><Stack spacing={2}><TextField select name="productId" label="Product" defaultValue="" error={!!error("productId")} helperText={error("productId")} required>{products.map((product) => <MenuItem key={product.id} value={product.id}>{product.name}</MenuItem>)}</TextField><TextField name="quantity" label="Quantity" type="number" defaultValue="1" slotProps={{ htmlInput: { min: 1 } }} error={!!error("quantity")} helperText={error("quantity")} /><TextField name="custom_price" label="Custom Price (optional)" type="text" error={!!error("custom_price")} helperText={error("custom_price")} /><TextField select name="currency" label="Currency" defaultValue="" error={!!error("currency")} helperText={error("currency")} required>{currencies.map((currency) => <MenuItem key={currency.code} value={currency.code}>{currency.symbol} {currency.code} — {currency.name}</MenuItem>)}</TextField><TextField select name="status" label="Status" defaultValue="ACTIVE" error={!!error("status")} helperText={error("status")}><MenuItem value="ACTIVE">Active</MenuItem><MenuItem value="PENDING">Pending</MenuItem></TextField><TextField name="start_date" label="Start Date" type="date" defaultValue={format(new Date(), "yyyy-MM-dd")} slotProps={{ inputLabel: { shrink: true } }} error={!!error("start_date")} helperText={error("start_date")} required /><TextField name="end_date" label="End Date (optional)" type="date" defaultValue="" slotProps={{ inputLabel: { shrink: true } }} error={!!error("end_date")} helperText={error("end_date")} /><TextField name="renewal_date" label="Renewal Date (optional)" type="date" defaultValue="" slotProps={{ inputLabel: { shrink: true } }} error={!!error("renewal_date")} helperText={error("renewal_date")} /><TextField name="notes" label="Notes" multiline minRows={4} error={!!error("notes")} helperText={error("notes")} /><Stack direction="row" spacing={1} sx={{ justifyContent: "flex-end" }}><Button type="button" onClick={() => setOpen(false)}>Close</Button><Button type="submit" variant="contained" disabled={isLoading}>{isLoading ? "Assigning…" : "Assign"}</Button></Stack></Stack></form></Box></Drawer></>;
}
