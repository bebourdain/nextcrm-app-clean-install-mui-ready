"use client";

import { useMemo } from "react";
import { Box, Card, CardContent, Divider, Stack, Typography } from "@mui/material";

interface LineItemValues {
  quantity: number;
  unitPrice: number;
  discountPercent: number;
  taxRate: number;
}

interface TotalsPanelProps {
  lineItems: LineItemValues[];
  currency: string;
  locale: string;
}

function computeLineTotals(line: LineItemValues) {
  const gross = line.quantity * line.unitPrice;
  const discount = (gross * line.discountPercent) / 100;
  const subtotal = Math.round((gross - discount) * 100) / 100;
  const vat = Math.round((subtotal * line.taxRate) / 100 * 100) / 100;
  const total = Math.round((subtotal + vat) * 100) / 100;
  return { subtotal, vat, total };
}

export function TotalsPanel({ lineItems, currency, locale }: TotalsPanelProps) {
  const totals = useMemo(() => {
    let subtotal = 0;
    let vatTotal = 0;
    let discountTotal = 0;
    const vatBuckets = new Map<number, { base: number; vat: number }>();

    for (const line of lineItems) {
      const lt = computeLineTotals(line);
      subtotal += lt.subtotal;
      vatTotal += lt.vat;

      const gross = line.quantity * line.unitPrice;
      discountTotal += (gross * line.discountPercent) / 100;

      const bucket = vatBuckets.get(line.taxRate) ?? { base: 0, vat: 0 };
      bucket.base += lt.subtotal;
      bucket.vat += lt.vat;
      vatBuckets.set(line.taxRate, bucket);
    }

    return {
      subtotal: Math.round(subtotal * 100) / 100,
      discountTotal: Math.round(discountTotal * 100) / 100,
      vatTotal: Math.round(vatTotal * 100) / 100,
      grandTotal: Math.round((subtotal + vatTotal) * 100) / 100,
      vatBreakdown: Array.from(vatBuckets.entries())
        .filter(([rate]) => rate > 0)
        .map(([rate, b]) => ({
          rate,
          base: Math.round(b.base * 100) / 100,
          vat: Math.round(b.vat * 100) / 100,
        })),
    };
  }, [lineItems]);

  const fmt = (n: number) =>
    new Intl.NumberFormat(locale, {
      style: "currency",
      currency: currency || "CZK",
      minimumFractionDigits: 2,
    }).format(n);

  return (
    <Card variant="outlined">
      <Box sx={{ p: 3, pb: 1.5 }}><Typography variant="h6" component="h2">Totals</Typography><Divider sx={{ mt: 2 }} /></Box>
      <CardContent sx={{ pt: 1.5 }}><Stack spacing={1}>
        <Stack direction="row" sx={{ justifyContent: "space-between" }}><Typography variant="body2" color="text.secondary">Subtotal</Typography><Typography variant="body2" sx={{ fontFamily: "monospace" }}>{fmt(totals.subtotal)}</Typography></Stack>
        {totals.discountTotal > 0 && (
          <Stack direction="row" sx={{ justifyContent: "space-between" }}><Typography variant="body2" color="text.secondary">Discount</Typography><Typography variant="body2" color="error" sx={{ fontFamily: "monospace" }}>-{fmt(totals.discountTotal)}</Typography></Stack>
        )}
        {totals.vatBreakdown.map((b) => (
          <Stack key={b.rate} direction="row" sx={{ justifyContent: "space-between" }}><Typography variant="body2" color="text.secondary">VAT {b.rate}%</Typography><Typography variant="body2" sx={{ fontFamily: "monospace" }}>{fmt(b.vat)}</Typography></Stack>
        ))}
        <Divider />
        <Stack direction="row" sx={{ justifyContent: "space-between" }}><Typography sx={{ fontWeight: 600 }}>Total</Typography><Typography sx={{ fontWeight: 600, fontFamily: "monospace" }}>{fmt(totals.grandTotal)}</Typography></Stack>
      </Stack></CardContent>
    </Card>
  );
}
