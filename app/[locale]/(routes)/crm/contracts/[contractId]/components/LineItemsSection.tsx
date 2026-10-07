"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Copy } from "lucide-react";
import { Box, Button, Card, CardContent, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Divider, MenuItem, Stack, TextField, Typography } from "@mui/material";
import type { LineItemData } from "../../../components/line-items/LineItemsTable";
import { removeContractLineItem } from "@/actions/crm/contract-line-items/remove-line-item";
import { copyLineItemsFromOpportunity } from "@/actions/crm/contract-line-items/copy-from-opportunity";
import { MuiLineItemsTable } from "./MuiLineItemsTable";
import { MuiLineItemForm } from "./MuiLineItemForm";

interface Props {
  contractId: string;
  lineItems: LineItemData[];
  currency: string;
  products: { id: string; name: string; sku: string | null; unit_price: number }[];
  opportunities: { id: string; name: string }[];
}
export default function LineItemsSection({ contractId, lineItems, currency, products, opportunities }: Props) {
  const router = useRouter();
  const [addOpen, setAddOpen] = useState(false);
  const [editItem, setEditItem] = useState<LineItemData | null>(null);
  const [copyOpen, setCopyOpen] = useState(false);
  const [opportunityId, setOpportunityId] = useState("");
  const [copying, setCopying] = useState(false);
  const copy = async () => {
    if (!opportunityId) { toast.error("Please select an opportunity"); return; }
    setCopying(true);
    try {
      const result = await copyLineItemsFromOpportunity(contractId, opportunityId);
      if (result?.error) toast.error(result.error);
      else { toast.success(`Copied ${result?.data?.copied || 0} line item(s) from opportunity`); setCopyOpen(false); setOpportunityId(""); router.refresh(); }
    } catch { toast.error("Could not copy line items."); }
    finally { setCopying(false); }
  };
  return <>
    <Card variant="outlined"><Box sx={{ p: 3, pb: 1.5 }}><Stack direction="row" sx={{ alignItems: "center", justifyContent: "space-between", gap: 2 }}>
      <Typography variant="h5" component="h2">Line Items</Typography>
      <Stack direction="row" spacing={1}>{opportunities.length > 0 && <Button variant="outlined" size="small" startIcon={<Copy size={16} />} onClick={() => setCopyOpen(true)}>Copy from Opportunity</Button>}<Button variant="contained" size="small" aria-label="Add Line Item" onClick={() => setAddOpen(true)}>+</Button></Stack>
    </Stack><Divider sx={{ mt: 2.5 }} /></Box><CardContent sx={{ pt: 1.5 }}><MuiLineItemsTable items={lineItems} currency={currency} onRemove={removeContractLineItem} onEdit={setEditItem} /></CardContent></Card>
    {(addOpen || editItem) && <MuiLineItemForm key={editItem?.id ?? "new"} open onClose={() => { setAddOpen(false); setEditItem(null); }} contractId={contractId} products={products} item={editItem} />}
    <Dialog open={copyOpen} onClose={() => { if (!copying) setCopyOpen(false); }} fullWidth maxWidth="sm"><DialogTitle>Copy Line Items from Opportunity</DialogTitle><DialogContent><DialogContentText>Select an opportunity to copy its line items into this contract. Existing line items will remain.</DialogContentText><TextField select fullWidth label="Opportunity" value={opportunityId} onChange={(event) => setOpportunityId(event.target.value)} sx={{ mt: 3 }}><MenuItem value="">Select an opportunity</MenuItem>{opportunities.map((opportunity) => <MenuItem key={opportunity.id} value={opportunity.id}>{opportunity.name}</MenuItem>)}</TextField></DialogContent><DialogActions><Button disabled={copying} onClick={() => setCopyOpen(false)}>Cancel</Button><Button variant="contained" disabled={copying || !opportunityId} onClick={copy}>{copying ? "Copying..." : "Copy"}</Button></DialogActions></Dialog>
  </>;
}
