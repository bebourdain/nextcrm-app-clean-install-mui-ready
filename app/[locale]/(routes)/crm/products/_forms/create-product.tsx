"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Add, Close } from "@mui/icons-material";
import { Box, Button, CircularProgress, Divider, Drawer, IconButton, Stack, Typography } from "@mui/material";
import type { crm_ProductCategories } from "@prisma/client";
import { toast } from "sonner";
import { useAction } from "@/hooks/use-action";
import { createProduct } from "@/actions/crm/products/create-product";
import { ProductFormFields } from "../components/ProductFormFields";

export default function CreateProductForm({ categories, currencies = [] }: { categories: crm_ProductCategories[]; currencies?: { code: string; name: string; symbol: string }[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isRecurring, setIsRecurring] = useState(false);
  const { execute, fieldErrors, isLoading } = useAction(createProduct, {
    onSuccess: () => { toast.success("Product created successfully"); setOpen(false); router.refresh(); },
    onError: (error) => toast.error(error),
  });

  const onAction = async (formData: FormData) => {
    await execute({
      name: String(formData.get("name") ?? ""),
      sku: String(formData.get("sku") ?? "") || undefined,
      type: formData.get("type") as "PRODUCT" | "SERVICE",
      status: formData.get("status") as "DRAFT" | "ACTIVE" | "ARCHIVED",
      unit_price: String(formData.get("unit_price") ?? ""),
      unit_cost: String(formData.get("unit_cost") ?? "") || undefined,
      currency: String(formData.get("currency") ?? ""),
      tax_rate: String(formData.get("tax_rate") ?? "") || undefined,
      unit: String(formData.get("unit") ?? "") || undefined,
      categoryId: String(formData.get("categoryId") ?? "") || undefined,
      description: String(formData.get("description") ?? "") || undefined,
      is_recurring: isRecurring,
      billing_period: isRecurring ? formData.get("billing_period") as "MONTHLY" | "QUARTERLY" | "ANNUALLY" | "ONE_TIME" : undefined,
    });
  };

  return <>
    <Button variant="contained" startIcon={<Add />} onClick={() => setOpen(true)} data-testid="add-product-btn">Create product</Button>
    <Drawer anchor="right" open={open} onClose={() => setOpen(false)} slotProps={{ paper: { sx: { width: { xs: "100%", md: 680 }, maxWidth: "100%" } } }}>
      <Stack direction="row" sx={{ px: 3, py: 2, alignItems: "center", justifyContent: "space-between" }}>
        <Box><Typography variant="h6">Create Product</Typography><Typography variant="body2" color="text.secondary">Add a new product or service to your catalog</Typography></Box>
        <IconButton aria-label="Close" onClick={() => setOpen(false)}><Close /></IconButton>
      </Stack>
      <Divider />
      <Box component="form" action={onAction} sx={{ p: 3, overflowY: "auto" }}>
        <ProductFormFields categories={categories} currencies={currencies} isRecurring={isRecurring} setIsRecurring={setIsRecurring} fieldErrors={fieldErrors} />
        <Button type="submit" variant="contained" disabled={isLoading} fullWidth sx={{ mt: 3 }}>{isLoading ? <CircularProgress size={22} color="inherit" /> : "Create"}</Button>
      </Box>
    </Drawer>
  </>;
}
