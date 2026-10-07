"use client";

import { Box, FormControlLabel, MenuItem, Stack, Switch, TextField } from "@mui/material";
import type { crm_ProductCategories } from "@prisma/client";

export interface ProductFormValue {
  name: string;
  sku: string | null;
  type: string;
  status: string;
  unit_price: number;
  unit_cost: number | null;
  currency: string;
  tax_rate: number | null;
  unit: string | null;
  is_recurring: boolean;
  billing_period: string | null;
  category: { id: string; name: string } | null;
  description: string | null;
}

interface Props {
  categories: crm_ProductCategories[];
  currencies: { code: string; name: string; symbol: string }[];
  product?: ProductFormValue;
  isRecurring: boolean;
  setIsRecurring: (value: boolean) => void;
  fieldErrors?: Record<string, string[] | undefined>;
}

export function ProductFormFields({ categories, currencies, product, isRecurring, setIsRecurring, fieldErrors }: Props) {
  const error = (name: string) => ({ error: Boolean(fieldErrors?.[name]?.length), helperText: fieldErrors?.[name]?.[0] });
  return <Stack spacing={2.5}>
    <TextField name="name" label="Name" defaultValue={product?.name ?? ""} required fullWidth {...error("name")} />
    <TextField name="sku" label="SKU" defaultValue={product?.sku ?? ""} fullWidth {...error("sku")} />
    <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 2 }}>
      <TextField select name="type" label="Type" defaultValue={product?.type ?? "PRODUCT"} fullWidth {...error("type")}>
        <MenuItem value="PRODUCT">Product</MenuItem><MenuItem value="SERVICE">Service</MenuItem>
      </TextField>
      <TextField select name="status" label="Status" defaultValue={product?.status ?? "DRAFT"} fullWidth {...error("status")}>
        <MenuItem value="DRAFT">Draft</MenuItem><MenuItem value="ACTIVE">Active</MenuItem><MenuItem value="ARCHIVED">Archived</MenuItem>
      </TextField>
      <TextField name="unit_price" label="Unit Price" type="number" slotProps={{ htmlInput: { min: 0, step: "any" } }} defaultValue={product?.unit_price ?? ""} required fullWidth {...error("unit_price")} />
      <TextField name="unit_cost" label="Unit Cost" type="number" slotProps={{ htmlInput: { min: 0, step: "any" } }} defaultValue={product?.unit_cost ?? ""} fullWidth {...error("unit_cost")} />
      <TextField select name="currency" label="Currency" defaultValue={product?.currency ?? currencies[0]?.code ?? ""} fullWidth {...error("currency")}>
        {currencies.map((currency) => <MenuItem key={currency.code} value={currency.code}>{currency.symbol} {currency.code} — {currency.name}</MenuItem>)}
      </TextField>
      <TextField name="tax_rate" label="Tax Rate (%)" type="number" slotProps={{ htmlInput: { min: 0, step: "any" } }} defaultValue={product?.tax_rate ?? ""} fullWidth {...error("tax_rate")} />
      <TextField name="unit" label="Unit" defaultValue={product?.unit ?? ""} fullWidth {...error("unit")} />
      <TextField select name="categoryId" label="Category" defaultValue={product?.category?.id ?? ""} fullWidth {...error("categoryId")}>
        <MenuItem value="">None</MenuItem>
        {categories.map((category) => <MenuItem key={category.id} value={category.id}>{category.name}</MenuItem>)}
      </TextField>
    </Box>
    <FormControlLabel control={<Switch checked={isRecurring} onChange={(_, checked) => setIsRecurring(checked)} />} label="Recurring billing" />
    {isRecurring && <TextField select name="billing_period" label="Billing Period" defaultValue={product?.billing_period ?? "MONTHLY"} fullWidth {...error("billing_period")}>
      <MenuItem value="MONTHLY">Monthly</MenuItem><MenuItem value="QUARTERLY">Quarterly</MenuItem><MenuItem value="ANNUALLY">Annually</MenuItem><MenuItem value="ONE_TIME">One Time</MenuItem>
    </TextField>}
    <TextField name="description" label="Description" defaultValue={product?.description ?? ""} multiline minRows={3} fullWidth {...error("description")} />
  </Stack>;
}
