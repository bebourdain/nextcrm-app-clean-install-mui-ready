"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { X } from "lucide-react";
import {
  Box,
  Button,
  Divider,
  Drawer,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { addContractLineItem } from "@/actions/crm/contract-line-items/add-line-item";
import { updateContractLineItem } from "@/actions/crm/contract-line-items/update-line-item";
import type { LineItemData } from "../../../components/line-items/LineItemsTable";

interface Product {
  id: string;
  name: string;
  sku: string | null;
  unit_price: number;
}

interface Props {
  open: boolean;
  onClose: () => void;
  contractId: string;
  products: Product[];
  item?: LineItemData | null;
}

export function MuiLineItemForm({ open, onClose, contractId, products, item }: Props) {
  const router = useRouter();
  const [productId, setProductId] = useState("");
  const [name, setName] = useState(item?.name ?? "");
  const [sku, setSku] = useState(item?.sku ?? "");
  const [quantity, setQuantity] = useState(String(item?.quantity ?? 1));
  const [unitPrice, setUnitPrice] = useState(String(item?.unit_price ?? ""));
  const [discountType, setDiscountType] = useState<"NONE" | "PERCENTAGE" | "FIXED">(
    item && item.discount_value > 0 ? item.discount_type : "NONE",
  );
  const [discountValue, setDiscountValue] = useState(String(item?.discount_value ?? 0));
  const [description, setDescription] = useState(item?.description ?? "");
  const [errors, setErrors] = useState<Record<string, string[] | undefined>>({});
  const [saving, setSaving] = useState(false);

  const selectProduct = (id: string) => {
    setProductId(id);
    const product = products.find((option) => option.id === id);
    if (product) {
      setName(product.name);
      setSku(product.sku ?? "");
      setUnitPrice(String(product.unit_price));
    }
  };

  const save = async () => {
    setSaving(true);
    setErrors({});
    try {
      const common = {
        name,
        quantity: Number(quantity),
        unit_price: unitPrice,
        discount_type: discountType === "NONE" ? "PERCENTAGE" as const : discountType,
        discount_value: discountType === "NONE" ? "0" : discountValue,
        description,
      };
      const result = item
        ? await updateContractLineItem({ id: item.id, ...common })
        : await addContractLineItem({
          contractId,
          productId: productId || undefined,
          sku: sku || undefined,
          sort_order: 0,
          ...common,
        });
      if (result?.fieldErrors) setErrors(result.fieldErrors);
      if (result?.error) toast.error(result.error);
      if (result?.data) {
        toast.success(item ? "Line item updated" : "Line item added");
        onClose();
        router.refresh();
      }
    } catch {
      toast.error(item ? "Could not update the line item." : "Could not add the line item.");
    } finally {
      setSaving(false);
    }
  };

  const field = (key: string) => ({
    error: Boolean(errors[key]?.length),
    helperText: errors[key]?.join(", "),
  });

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={saving ? undefined : onClose}
      slotProps={{ paper: { sx: { width: { xs: "100%", sm: 520 }, maxWidth: "100%" } } }}
    >
      <Stack direction="row" sx={{ p: 3, alignItems: "flex-start", justifyContent: "space-between", gap: 2 }}>
        <Box>
          <Typography variant="h5">{item ? "Edit Line Item" : "Add Line Item"}</Typography>
          <Typography variant="body2" color="text.secondary">{item ? "Update the line item details" : "Add a product or custom line item"}</Typography>
        </Box>
        <IconButton aria-label="Close" onClick={onClose} disabled={saving}><X size={18} /></IconButton>
      </Stack>
      <Divider />
      <Box component="form" onSubmit={(event) => { event.preventDefault(); void save(); }} sx={{ p: 3, display: "grid", gap: 2, overflowY: "auto" }}>
        {!item && (
          <FormControl size="small" fullWidth>
            <InputLabel id="line-item-product-label">Product (optional)</InputLabel>
            <Select labelId="line-item-product-label" label="Product (optional)" value={productId} onChange={(event) => selectProduct(event.target.value)}>
              <MenuItem value="">Select a product</MenuItem>
              {products.map((product) => <MenuItem key={product.id} value={product.id}>{product.name}{product.sku ? ` (${product.sku})` : ""}</MenuItem>)}
            </Select>
          </FormControl>
        )}
        <TextField label="Name" name="name" required value={name} onChange={(event) => setName(event.target.value)} {...field("name")} />
        {!item && <TextField label="SKU" name="sku" value={sku} onChange={(event) => setSku(event.target.value)} {...field("sku")} />}
        <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
          <TextField label="Quantity" name="quantity" type="number" required value={quantity} onChange={(event) => setQuantity(event.target.value)} slotProps={{ htmlInput: { min: 1, step: 1 } }} fullWidth {...field("quantity")} />
          <TextField label="Unit Price" name="unit_price" type="number" required value={unitPrice} onChange={(event) => setUnitPrice(event.target.value)} slotProps={{ htmlInput: { min: 0, step: "any" } }} fullWidth {...field("unit_price")} />
        </Stack>
        <FormControl size="small" fullWidth>
          <InputLabel id="line-item-discount-label">Discount Type</InputLabel>
          <Select labelId="line-item-discount-label" label="Discount Type" value={discountType} onChange={(event) => setDiscountType(event.target.value as typeof discountType)}>
            <MenuItem value="NONE">None</MenuItem>
            <MenuItem value="PERCENTAGE">Percentage (%)</MenuItem>
            <MenuItem value="FIXED">Fixed Amount</MenuItem>
          </Select>
        </FormControl>
        {discountType !== "NONE" && (
          <TextField label={discountType === "PERCENTAGE" ? "Discount (%)" : "Discount Amount"} name="discount_value" type="number" value={discountValue} onChange={(event) => setDiscountValue(event.target.value)} slotProps={{ htmlInput: { min: 0, step: "any" } }} {...field("discount_value")} />
        )}
        <TextField label="Description" name="description" multiline minRows={3} value={description} onChange={(event) => setDescription(event.target.value)} {...field("description")} />
        <Button type="submit" variant="contained" disabled={saving}>{saving ? "Saving..." : item ? "Save Changes" : "Add Line Item"}</Button>
      </Box>
    </Drawer>
  );
}
