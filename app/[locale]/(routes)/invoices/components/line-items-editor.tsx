"use client";

import { Box, Button, IconButton, MenuItem, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Tooltip } from "@mui/material";
import { Trash2 } from "lucide-react";

interface Product {
  id: string;
  name: string;
}

interface TaxRate {
  id: string;
  name: string;
  rate: string;
}

export interface LineItemRow {
  productId: string;
  description: string;
  quantity: number;
  unitPrice: number;
  discountPercent: number;
  taxRateId: string;
}

interface LineItemsEditorProps {
  items: LineItemRow[];
  onChange: (items: LineItemRow[]) => void;
  products: Product[];
  taxRates: TaxRate[];
  labels?: {
    product?: string;
    description?: string;
    quantity?: string;
    unitPrice?: string;
    discount?: string;
    taxRate?: string;
    total?: string;
    addLine?: string;
  };
}

function computeLineTotal(
  qty: number,
  price: number,
  discount: number,
  taxRate: number
) {
  const gross = qty * price;
  const disc = (gross * discount) / 100;
  const sub = gross - disc;
  const vat = (sub * taxRate) / 100;
  return Math.round((sub + vat) * 100) / 100;
}

export function LineItemsEditor({
  items,
  onChange,
  products,
  taxRates,
  labels,
}: LineItemsEditorProps) {
  const updateItem = (index: number, patch: Partial<LineItemRow>) => {
    const next = items.map((item, i) =>
      i === index ? { ...item, ...patch } : item
    );
    onChange(next);
  };

  const removeItem = (index: number) => {
    onChange(items.filter((_, i) => i !== index));
  };

  const addItem = () => {
    onChange([
      ...items,
      {
        productId: "",
        description: "",
        quantity: 1,
        unitPrice: 0,
        discountPercent: 0,
        taxRateId: "",
      },
    ]);
  };

  const handleProductSelect = (index: number, productId: string) => {
    const product = products.find((p) => p.id === productId);
    updateItem(index, {
      productId,
      description: product?.name ?? items[index].description,
    });
  };

  const getTaxRateValue = (taxRateId: string) => {
    const tr = taxRates.find((t) => t.id === taxRateId);
    return tr ? parseFloat(tr.rate) : 0;
  };

  const l = labels ?? {};

  return (
    <Box>
      <TableContainer sx={{ border: 1, borderColor: "divider", borderRadius: 1 }}>
        <Table aria-label="Invoice line items" sx={{ minWidth: 1050, "& .MuiTableCell-head": { fontSize: 13, color: "text.secondary", whiteSpace: "nowrap" }, "& .MuiTableCell-body": { p: 1 } }}>
          <TableHead><TableRow>
            <TableCell sx={{ width: 170 }}>{l.product ?? "Product"}</TableCell>
            <TableCell sx={{ minWidth: 220 }}>{l.description ?? "Description"}</TableCell>
            <TableCell sx={{ width: 90 }}>{l.quantity ?? "Qty"}</TableCell>
            <TableCell sx={{ width: 120 }}>{l.unitPrice ?? "Unit Price"}</TableCell>
            <TableCell sx={{ width: 100 }}>{l.discount ?? "Disc %"}</TableCell>
            <TableCell sx={{ width: 145 }}>{l.taxRate ?? "Tax Rate"}</TableCell>
            <TableCell align="right" sx={{ width: 100 }}>{l.total ?? "Total"}</TableCell>
            <TableCell sx={{ width: 50 }} aria-label="Remove" />
          </TableRow></TableHead>
          <TableBody>{items.map((item, index) => {
            const lineTotal = computeLineTotal(item.quantity, item.unitPrice, item.discountPercent, getTaxRateValue(item.taxRateId));
            return <TableRow key={index}>
              <TableCell><TextField select size="small" fullWidth aria-label={`${l.product ?? "Product"} ${index + 1}`} value={item.productId} onChange={(event) => handleProductSelect(index, event.target.value)}><MenuItem value="">-</MenuItem>{products.map((product) => <MenuItem key={product.id} value={product.id}>{product.name}</MenuItem>)}</TextField></TableCell>
              <TableCell><TextField size="small" fullWidth aria-label={`${l.description ?? "Description"} ${index + 1}`} value={item.description} onChange={(event) => updateItem(index, { description: event.target.value })} placeholder="Description" /></TableCell>
              <TableCell><TextField size="small" fullWidth type="number" aria-label={`${l.quantity ?? "Qty"} ${index + 1}`} value={item.quantity} onChange={(event) => updateItem(index, { quantity: parseFloat(event.target.value) || 0 })} slotProps={{ htmlInput: { min: 0, step: "0.01" } }} /></TableCell>
              <TableCell><TextField size="small" fullWidth type="number" aria-label={`${l.unitPrice ?? "Unit Price"} ${index + 1}`} value={item.unitPrice} onChange={(event) => updateItem(index, { unitPrice: parseFloat(event.target.value) || 0 })} slotProps={{ htmlInput: { min: 0, step: "0.01" } }} /></TableCell>
              <TableCell><TextField size="small" fullWidth type="number" aria-label={`${l.discount ?? "Disc %"} ${index + 1}`} value={item.discountPercent} onChange={(event) => updateItem(index, { discountPercent: parseFloat(event.target.value) || 0 })} slotProps={{ htmlInput: { min: 0, max: 100, step: "0.01" } }} /></TableCell>
              <TableCell><TextField select size="small" fullWidth aria-label={`${l.taxRate ?? "Tax Rate"} ${index + 1}`} value={item.taxRateId} onChange={(event) => updateItem(index, { taxRateId: event.target.value })}><MenuItem value="">None</MenuItem>{taxRates.map((rate) => <MenuItem key={rate.id} value={rate.id}>{rate.name} ({rate.rate}%)</MenuItem>)}</TextField></TableCell>
              <TableCell align="right" sx={{ fontFamily: "monospace", whiteSpace: "nowrap" }}>{lineTotal.toFixed(2)}</TableCell>
              <TableCell><Tooltip title="Remove line"><span><IconButton aria-label={`Remove line ${index + 1}`} size="small" color="error" onClick={() => removeItem(index)} disabled={items.length <= 1}><Trash2 size={16} /></IconButton></span></Tooltip></TableCell>
            </TableRow>;
          })}</TableBody>
        </Table>
      </TableContainer>
      <Button type="button" variant="outlined" size="small" onClick={addItem} sx={{ mt: 2 }}>+ {l.addLine ?? "Add Line"}</Button>
    </Box>
  );
}
