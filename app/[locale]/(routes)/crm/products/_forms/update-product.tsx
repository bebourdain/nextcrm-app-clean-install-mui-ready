"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Close } from "@mui/icons-material";
import { Box, Button, CircularProgress, Divider, Drawer, IconButton, Stack, Typography } from "@mui/material";
import type { crm_ProductCategories } from "@prisma/client";
import { toast } from "sonner";
import { useAction } from "@/hooks/use-action";
import { updateProduct } from "@/actions/crm/products/update-product";
import { ProductFormFields, type ProductFormValue } from "../components/ProductFormFields";

interface Props {
  onOpen: boolean;
  setOpen: (open: boolean) => void;
  product: ProductFormValue & { id: string };
  categories: crm_ProductCategories[];
  currencies?: { code: string; name: string; symbol: string }[];
}

export default function UpdateProductForm({ onOpen, setOpen, product, categories, currencies = [] }: Props) {
  const router = useRouter();
  const [isRecurring, setIsRecurring] = useState(product.is_recurring);
  const { execute, fieldErrors, isLoading } = useAction(updateProduct, {
    onSuccess: () => { toast.success("Product updated successfully"); setOpen(false); router.refresh(); },
    onError: (error) => toast.error(error),
  });

  const onAction = async (formData: FormData) => {
    await execute({
      id: product.id,
      name: String(formData.get("name") ?? ""),
      sku: String(formData.get("sku") ?? "") || undefined,
      type: formData.get("type") as "PRODUCT" | "SERVICE",
      status: formData.get("status") as "DRAFT" | "ACTIVE" | "ARCHIVED",
      unit_price: String(formData.get("unit_price") ?? "") || undefined,
      unit_cost: String(formData.get("unit_cost") ?? "") || undefined,
      currency: String(formData.get("currency") ?? "") || undefined,
      tax_rate: String(formData.get("tax_rate") ?? "") || undefined,
      unit: String(formData.get("unit") ?? "") || undefined,
      categoryId: String(formData.get("categoryId") ?? "") || null,
      description: String(formData.get("description") ?? "") || undefined,
      is_recurring: isRecurring,
      billing_period: isRecurring ? formData.get("billing_period") as "MONTHLY" | "QUARTERLY" | "ANNUALLY" | "ONE_TIME" : null,
    });
  };

  return <Drawer anchor="right" open={onOpen} onClose={() => setOpen(false)} slotProps={{ paper: { sx: { width: { xs: "100%", md: 680 }, maxWidth: "100%" } } }}>
    <Stack direction="row" sx={{ px: 3, py: 2, alignItems: "center", justifyContent: "space-between" }}>
      <Box><Typography variant="h6">Update Product</Typography><Typography variant="body2" color="text.secondary">Update the product details</Typography></Box>
      <IconButton aria-label="Close" onClick={() => setOpen(false)}><Close /></IconButton>
    </Stack>
    <Divider />
    <Box component="form" action={onAction} sx={{ p: 3, overflowY: "auto" }}>
      <ProductFormFields categories={categories} currencies={currencies} product={product} isRecurring={isRecurring} setIsRecurring={setIsRecurring} fieldErrors={fieldErrors} />
      <Button type="submit" variant="contained" disabled={isLoading} fullWidth sx={{ mt: 3 }}>{isLoading ? <CircularProgress size={22} color="inherit" /> : "Update"}</Button>
    </Box>
  </Drawer>;
}
