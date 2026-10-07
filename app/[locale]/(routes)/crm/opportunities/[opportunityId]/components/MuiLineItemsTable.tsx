"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Pencil, Trash2 } from "lucide-react";
import {
  IconButton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableFooter,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
} from "@mui/material";
import type { LineItemData } from "../../../components/line-items/LineItemsTable";

interface Props {
  items: LineItemData[];
  currency: string;
  onRemove: (id: string) => Promise<{ error?: string } | void>;
  onEdit: (item: LineItemData) => void;
}

function formatPrice(amount: number, currency: string): string {
  const isWhole = amount % 1 === 0;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: isWhole ? 0 : 2,
    maximumFractionDigits: isWhole ? 0 : 2,
  }).format(amount);
}

export function MuiLineItemsTable({ items, currency, onRemove, onEdit }: Props) {
  const router = useRouter();
  const [removingId, setRemovingId] = useState<string | null>(null);

  const handleRemove = async (id: string) => {
    setRemovingId(id);
    try {
      const result = await onRemove(id);
      if (result?.error) toast.error(result.error);
      else {
        toast.success("Line item removed");
        router.refresh();
      }
    } catch {
      toast.error("Could not remove the line item.");
    } finally {
      setRemovingId(null);
    }
  };

  if (!items?.length) {
    return <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>No line items yet. Add one to get started.</Typography>;
  }

  const subtotal = items.reduce((sum, item) => sum + item.line_total, 0);
  const numberCell = { textAlign: "right" as const, whiteSpace: "nowrap" };

  return (
    <TableContainer sx={{ border: 1, borderColor: "divider", borderRadius: 1 }}>
      <Table aria-label="Opportunity line items" sx={{
        minWidth: 720,
        "& .MuiTableCell-head": { height: 48, fontSize: 14, fontWeight: 500, color: "text.secondary" },
        "& .MuiTableCell-body": { fontSize: 14 },
      }}>
        <TableHead>
          <TableRow>
            <TableCell width={48}>#</TableCell>
            <TableCell>Product</TableCell>
            <TableCell sx={numberCell}>Qty</TableCell>
            <TableCell sx={numberCell}>Unit Price</TableCell>
            <TableCell sx={numberCell}>Discount</TableCell>
            <TableCell sx={numberCell}>Line Total</TableCell>
            <TableCell align="right">Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {items.map((item, index) => (
            <TableRow key={item.id} hover>
              <TableCell sx={{ color: "text.secondary" }}>{index + 1}</TableCell>
              <TableCell>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>{item.name}</Typography>
                {item.sku && <Typography variant="caption" color="text.secondary">{item.sku}</Typography>}
              </TableCell>
              <TableCell sx={numberCell}>{item.quantity}</TableCell>
              <TableCell sx={numberCell}>{formatPrice(item.unit_price, item.currency || currency)}</TableCell>
              <TableCell sx={numberCell}>
                {item.discount_type === "PERCENTAGE" && item.discount_value > 0
                  ? `${item.discount_value}%`
                  : item.discount_type === "FIXED" && item.discount_value > 0
                    ? formatPrice(item.discount_value, item.currency || currency)
                    : "—"}
              </TableCell>
              <TableCell sx={{ ...numberCell, fontWeight: 600 }}>{formatPrice(item.line_total, item.currency || currency)}</TableCell>
              <TableCell align="right">
                <Stack direction="row" spacing={0.5} sx={{ justifyContent: "flex-end" }}>
                  <Tooltip title="Edit line item"><IconButton size="small" aria-label={`Edit ${item.name}`} onClick={() => onEdit(item)}><Pencil size={16} /></IconButton></Tooltip>
                  <Tooltip title="Remove line item"><span><IconButton size="small" color="error" aria-label={`Remove ${item.name}`} disabled={removingId !== null} onClick={() => handleRemove(item.id)}><Trash2 size={16} /></IconButton></span></Tooltip>
                </Stack>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
        <TableFooter>
          <TableRow>
            <TableCell colSpan={5} align="right" sx={{ fontWeight: 600 }}>Subtotal</TableCell>
            <TableCell sx={{ ...numberCell, fontWeight: 700 }}>{formatPrice(subtotal, currency)}</TableCell>
            <TableCell />
          </TableRow>
        </TableFooter>
      </Table>
    </TableContainer>
  );
}
