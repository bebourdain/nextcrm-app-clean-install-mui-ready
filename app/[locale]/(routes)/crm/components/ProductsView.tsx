"use client";

import Link from "next/link";
import { Card, CardContent, Divider, Stack, Typography } from "@mui/material";
import type { crm_ProductCategories } from "@prisma/client";
import { ProductsDataTable } from "../products/table-components/data-table";
import CreateProductForm from "../products/_forms/create-product";
import { ImportProductsDialog } from "../products/components/ImportProductsDialog";

interface ProductsViewProps {
  data: any[];
  categories: crm_ProductCategories[];
  currencies: { code: string; name: string; symbol: string }[];
}

export default function ProductsView({ data, categories, currencies }: ProductsViewProps) {
  return <Card variant="outlined">
    <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ px: 3, py: 2, alignItems: { sm: "center" }, justifyContent: "space-between" }}>
      <Typography variant="h6" component={Link} href="/crm/products" sx={{ color: "text.primary", textDecoration: "none", "&:hover": { textDecoration: "underline" } }}>Product Catalog</Typography>
      <Stack direction="row" spacing={1}><ImportProductsDialog /><CreateProductForm categories={categories} currencies={currencies} /></Stack>
    </Stack>
    <Divider />
    <CardContent>
      {!data?.length ? <Typography color="text.secondary" sx={{ py: 4, textAlign: "center" }}>No products found. Create your first product to get started.</Typography> : <ProductsDataTable data={data} />}
    </CardContent>
  </Card>;
}
