"use client";

import Link from "next/link";
import { Chip, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from "@mui/material";
import { Decimal } from "@prisma/client/runtime/client";
import { formatCurrency } from "@/lib/currency-format";

interface Assignment {
  id: string; status: string; quantity: number; custom_price: number | null;
  start_date: string | Date | null; end_date: string | Date | null; renewal_date: string | Date | null;
  account: { id: string; name: string };
}

export function AccountsTab({ assignments, productPrice, productCurrency }: { assignments: Assignment[]; productPrice: number; productCurrency: string }) {
  const date = (value: string | Date | null) => value ? new Intl.DateTimeFormat("en-US", { dateStyle: "medium" }).format(new Date(value)) : "—";
  const money = (value: number | null) => formatCurrency(new Decimal(String(value ?? productPrice)), productCurrency);
  if (!assignments?.length) return <Paper variant="outlined" sx={{ p: 5, textAlign: "center" }}><Typography color="text.secondary">No accounts assigned to this product yet.</Typography></Paper>;
  return <TableContainer component={Paper} variant="outlined"><Table size="small">
    <TableHead><TableRow><TableCell>Account</TableCell><TableCell>Status</TableCell><TableCell align="right">Qty</TableCell><TableCell align="right">Price</TableCell><TableCell>Start Date</TableCell><TableCell>End Date</TableCell><TableCell>Renewal Date</TableCell></TableRow></TableHead>
    <TableBody>{assignments.map((assignment) => <TableRow key={assignment.id} hover>
      <TableCell><Typography component={Link} href={`/crm/accounts/${assignment.account.id}`} sx={{ color: "primary.main", textDecoration: "none", "&:hover": { textDecoration: "underline" } }}>{assignment.account.name}</Typography></TableCell>
      <TableCell><Chip size="small" label={assignment.status} color={assignment.status === "ACTIVE" ? "success" : assignment.status === "PENDING" ? "default" : "warning"} /></TableCell>
      <TableCell align="right">{assignment.quantity}</TableCell><TableCell align="right">{money(assignment.custom_price)}</TableCell>
      <TableCell>{date(assignment.start_date)}</TableCell><TableCell>{date(assignment.end_date)}</TableCell><TableCell>{date(assignment.renewal_date)}</TableCell>
    </TableRow>)}</TableBody>
  </Table></TableContainer>;
}
