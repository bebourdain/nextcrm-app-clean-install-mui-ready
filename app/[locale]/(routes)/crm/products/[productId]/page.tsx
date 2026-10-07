import { Box, Divider, Typography } from "@mui/material";
import { MuiPageHeader } from "@/components/mui/MuiPageHeader";
import { getProduct } from "@/actions/crm/products/get-product";
import { getProductCategories } from "@/actions/crm/products/get-product-categories";
import { getAllCrmData } from "@/actions/crm/get-crm-data";
import { serializeDecimals, serializeDecimalsList } from "@/lib/serialize-decimals";

import { BasicView } from "./components/BasicView";
import { AccountsTab } from "./components/AccountsTab";
import { HistoryTab } from "./components/HistoryTab";
import { EditProductButton } from "./components/EditProductButton";
import { ProductDetailTabs } from "./components/ProductDetailTabs";

interface ProductDetailPageProps {
  params: Promise<{ productId: string }>;
}

const ProductPage = async (props: ProductDetailPageProps) => {
  const params = await props.params;
  const { productId } = params;

  const [product, categories, crmData] = await Promise.all([
    getProduct(productId),
    getProductCategories(),
    getAllCrmData(),
  ]);

  if (!product) return <Typography>Product not found</Typography>;

  // Serialize decimal values for client components
  const serializedProduct = serializeDecimals(product);
  const serializedAssignments = serializeDecimalsList(
    product.accountProducts ?? []
  );

  const currencies = crmData.currencies.map(
    (c: { code: string; name: string; symbol: string }) => ({
      code: c.code,
      name: c.name,
      symbol: c.symbol,
    })
  );

  const productForEdit = {
    id: serializedProduct.id,
    name: serializedProduct.name,
    description: serializedProduct.description,
    sku: serializedProduct.sku,
    type: serializedProduct.type,
    status: serializedProduct.status,
    unit_price: serializedProduct.unit_price as unknown as number,
    unit_cost: serializedProduct.unit_cost as unknown as number | null,
    currency: serializedProduct.currency,
    tax_rate: serializedProduct.tax_rate as unknown as number | null,
    unit: serializedProduct.unit,
    is_recurring: serializedProduct.is_recurring,
    billing_period: serializedProduct.billing_period,
    category: serializedProduct.category,
  };

  return (
    <Box sx={{ width: "100%", pb: 6 }}>
      <MuiPageHeader title={`Product: ${product.name}`} description={`Status: ${product.status}`} />
      <Divider sx={{ my: 2 }} />
      <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 2 }}>
        <EditProductButton
          product={productForEdit}
          categories={categories}
          currencies={currencies}
        />
      </Box>
      <ProductDetailTabs accountCount={serializedAssignments.length}
        basic={<BasicView
            data={{
              ...serializedProduct,
              unit_price: serializedProduct.unit_price as unknown as number,
              unit_cost: serializedProduct.unit_cost as unknown as number | null,
              tax_rate: serializedProduct.tax_rate as unknown as number | null,
            }}
          />}
        accounts={<AccountsTab
            assignments={serializedAssignments as any}
            productPrice={serializedProduct.unit_price as unknown as number}
            productCurrency={serializedProduct.currency}
          />}
        history={<HistoryTab productId={productId} />}
      />
    </Box>
  );
};

export default ProductPage;
