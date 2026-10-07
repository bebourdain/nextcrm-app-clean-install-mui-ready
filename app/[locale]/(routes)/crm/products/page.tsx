import React, { Suspense } from "react";
import { Box, Divider, Skeleton } from "@mui/material";
import { MuiPageHeader } from "@/components/mui/MuiPageHeader";
import { getAllCrmData } from "@/actions/crm/get-crm-data";
import { getProductsFull } from "@/actions/crm/products/get-products";
import { getProductCategories } from "@/actions/crm/products/get-product-categories";
import ProductsView from "../components/ProductsView";
import { serializeDecimalsList } from "@/lib/serialize-decimals";

const ProductsPage = async () => {
  const [products, categories, crmData] = await Promise.all([
    getProductsFull(),
    getProductCategories(),
    getAllCrmData(),
  ]);

  const serializedProducts = serializeDecimalsList(products);

  return (
    <Box sx={{ width: "100%", pb: 6 }}>
      <MuiPageHeader title="Products" description="Manage your product and service catalog" />
      <Divider sx={{ my: 2 }} />
      <Suspense fallback={<Skeleton variant="rounded" height={360} />}>
        <ProductsView
          data={serializedProducts}
          categories={categories}
          currencies={crmData.currencies.map((c: { code: string; name: string; symbol: string }) => ({
            code: c.code,
            name: c.name,
            symbol: c.symbol,
          }))}
        />
      </Suspense>
    </Box>
  );
};

export default ProductsPage;
