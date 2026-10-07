"use client";

import { useState } from "react";
import { Box, Button, Card, CardContent, Divider, Stack, Typography } from "@mui/material";
import type { LineItemData } from "../../../components/line-items/LineItemsTable";
import { removeOpportunityLineItem } from "@/actions/crm/opportunity-line-items/remove-line-item";
import { MuiLineItemsTable } from "./MuiLineItemsTable";
import { MuiLineItemForm } from "./MuiLineItemForm";

interface LineItemsSectionProps {
  opportunityId: string;
  lineItems: LineItemData[];
  currency: string;
  products: { id: string; name: string; sku: string | null; unit_price: number }[];
}

export default function LineItemsSection({ opportunityId, lineItems, currency, products }: LineItemsSectionProps) {
  const [addOpen, setAddOpen] = useState(false);
  const [editItem, setEditItem] = useState<LineItemData | null>(null);

  return (
    <>
      <Card>
        <Box sx={{ p: 3, pb: 1.5 }}>
          <Stack direction="row" sx={{ alignItems: "center", justifyContent: "space-between", gap: 2 }}>
            <Typography variant="h5" component="h2">Line Items</Typography>
            <Button variant="contained" size="small" aria-label="Add Line Item" onClick={() => setAddOpen(true)}>+</Button>
          </Stack>
          <Divider sx={{ mt: 2.5 }} />
        </Box>
        <CardContent sx={{ pt: 1.5 }}>
          <MuiLineItemsTable items={lineItems} currency={currency} onRemove={removeOpportunityLineItem} onEdit={setEditItem} />
        </CardContent>
      </Card>
      {(addOpen || editItem) && (
        <MuiLineItemForm
          key={editItem?.id ?? "new"}
          open
          onClose={() => { setAddOpen(false); setEditItem(null); }}
          opportunityId={opportunityId}
          products={products}
          item={editItem}
        />
      )}
    </>
  );
}
