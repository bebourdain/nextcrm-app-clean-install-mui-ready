"use client";

import { useMemo, useState } from "react";
import { useLocale } from "next-intl";
import Link from "next/link";
import { Box, Button, Table, TableBody, TableCell, TableContainer, TableHead, TablePagination, TableRow, TableSortLabel, Typography } from "@mui/material";
import { StatusBadge } from "./status-badge";

interface Invoice {
  id: string;
  number: string | null;
  type: string;
  status: string;
  issueDate: string | null;
  dueDate: string | null;
  grandTotal: string;
  currency: string;
  account: { id: string; name: string } | null;
  series: { id: string; name: string } | null;
}
type SortField = "number" | "account" | "issueDate" | "dueDate" | "grandTotal" | "status";
type SortDir = "asc" | "desc";
interface InvoicesTableProps {
  invoices: Invoice[];
  statusLabels?: Record<string, string>;
  tableLabels?: { number?: string; account?: string; issueDate?: string; dueDate?: string; total?: string; status?: string; type?: string; currency?: string };
}
function formatDate(value: string | null, locale: string) {
  return value ? new Date(value).toLocaleDateString(locale) : "-";
}
function formatCurrency(amount: string, currency: string, locale: string) {
  const num = parseFloat(amount);
  if (isNaN(num)) return amount;
  return new Intl.NumberFormat(locale, { style: "currency", currency, minimumFractionDigits: 2 }).format(num);
}

export function InvoicesTable({ invoices, statusLabels, tableLabels }: InvoicesTableProps) {
  const locale = useLocale();
  const [sortField, setSortField] = useState<SortField>("issueDate");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const toggleSort = (field: SortField) => {
    if (sortField === field) setSortDir((current) => current === "asc" ? "desc" : "asc");
    else { setSortField(field); setSortDir("asc"); }
    setPage(0);
  };
  const sorted = useMemo(() => {
    const copy = [...invoices];
    copy.sort((a, b) => {
      let cmp = 0;
      switch (sortField) {
        case "number": cmp = (a.number ?? "").localeCompare(b.number ?? ""); break;
        case "account": cmp = (a.account?.name ?? "").localeCompare(b.account?.name ?? ""); break;
        case "issueDate": cmp = (a.issueDate ?? "").localeCompare(b.issueDate ?? ""); break;
        case "dueDate": cmp = (a.dueDate ?? "").localeCompare(b.dueDate ?? ""); break;
        case "grandTotal": cmp = parseFloat(a.grandTotal) - parseFloat(b.grandTotal); break;
        case "status": cmp = a.status.localeCompare(b.status); break;
      }
      return sortDir === "asc" ? cmp : -cmp;
    });
    return copy;
  }, [invoices, sortField, sortDir]);
  const currentPage = Math.min(page, Math.max(0, Math.ceil(sorted.length / rowsPerPage) - 1));
  const isOverdue = (invoice: Invoice) => invoice.status === "OVERDUE" || Boolean(invoice.dueDate && ["ISSUED", "SENT", "PARTIALLY_PAID"].includes(invoice.status) && new Date(invoice.dueDate) < new Date());
  const labels = tableLabels ?? {};
  const header = (field: SortField, label: string) => <TableCell sortDirection={sortField === field ? sortDir : false} sx={{ fontSize: 14, fontWeight: 500 }}><TableSortLabel active={sortField === field} direction={sortField === field ? sortDir : "asc"} onClick={() => toggleSort(field)}>{label}</TableSortLabel></TableCell>;
  return <Box>
    <TableContainer sx={{ border: 1, borderColor: "divider", borderRadius: 1 }}>
      <Table data-testid="invoices-table" aria-label="Invoices" sx={{ minWidth: 760, "& .MuiTableCell-head": { height: 48, color: "text.secondary" }, "& .MuiTableCell-body": { fontSize: 14 } }}>
        <TableHead><TableRow>{header("number", labels.number ?? "Number")}{header("account", labels.account ?? "Account")}{header("issueDate", labels.issueDate ?? "Issued")}{header("dueDate", labels.dueDate ?? "Due")}{header("grandTotal", labels.total ?? "Total")}{header("status", labels.status ?? "Status")}</TableRow></TableHead>
        <TableBody>
          {sorted.slice(currentPage * rowsPerPage, (currentPage + 1) * rowsPerPage).map((invoice) => <TableRow key={invoice.id} hover sx={isOverdue(invoice) ? { bgcolor: (theme) => theme.alpha(theme.palette.error.main, 0.08) } : undefined}>
            <TableCell><Button component={Link} href={`/invoices/${invoice.id}`} variant="text" sx={{ p: 0, minWidth: 0, color: "primary.main", fontSize: 14, fontWeight: 600, textTransform: "none", "&:hover": { bgcolor: "transparent", textDecoration: "underline" } }}>{invoice.number ?? "DRAFT"}</Button></TableCell>
            <TableCell>{invoice.account?.name ?? "-"}</TableCell><TableCell>{formatDate(invoice.issueDate, locale)}</TableCell><TableCell>{formatDate(invoice.dueDate, locale)}</TableCell><TableCell sx={{ fontFamily: "monospace" }}>{formatCurrency(invoice.grandTotal, invoice.currency, locale)}</TableCell><TableCell><StatusBadge status={invoice.status} labels={statusLabels} /></TableCell>
          </TableRow>)}
          {sorted.length === 0 && <TableRow><TableCell colSpan={6} align="center"><Typography variant="body2" color="text.secondary" sx={{ py: 4 }}>No invoices found</Typography></TableCell></TableRow>}
        </TableBody>
      </Table>
    </TableContainer>
    <TablePagination component="div" count={sorted.length} page={currentPage} rowsPerPage={rowsPerPage} onPageChange={(_, next) => setPage(next)} onRowsPerPageChange={(event) => { setRowsPerPage(Number(event.target.value)); setPage(0); }} rowsPerPageOptions={[10, 20, 30, 50]} />
  </Box>;
}
