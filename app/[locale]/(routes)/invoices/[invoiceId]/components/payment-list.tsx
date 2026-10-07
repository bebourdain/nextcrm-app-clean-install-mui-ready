"use client";

import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from "@mui/material";

interface Payment { id: string; paidAt: string; amount: string; method: string | null; reference: string | null; note: string | null }
export function PaymentList({ payments, currency, locale }: { payments: Payment[]; currency: string; locale: string }) {
  const fmt = (value: string) => new Intl.NumberFormat(locale, { style: "currency", currency: currency || "CZK", minimumFractionDigits: 2 }).format(parseFloat(value));
  if (payments.length === 0) return <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>No payments recorded</Typography>;
  return <TableContainer sx={{ border: 1, borderColor: "divider", borderRadius: 1 }}><Table aria-label="Invoice payments" sx={{ minWidth: 650 }}>
    <TableHead><TableRow><TableCell>Date</TableCell><TableCell>Amount</TableCell><TableCell>Method</TableCell><TableCell>Reference</TableCell><TableCell>Note</TableCell></TableRow></TableHead>
    <TableBody>{payments.map((payment) => <TableRow key={payment.id} hover><TableCell>{new Date(payment.paidAt).toLocaleDateString(locale)}</TableCell><TableCell sx={{ fontFamily: "monospace" }}>{fmt(payment.amount)}</TableCell><TableCell>{payment.method ?? "-"}</TableCell><TableCell>{payment.reference ?? "-"}</TableCell><TableCell>{payment.note ?? "-"}</TableCell></TableRow>)}</TableBody>
  </Table></TableContainer>;
}
