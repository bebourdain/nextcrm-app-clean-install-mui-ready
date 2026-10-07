import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { getLocale, getTranslations } from "next-intl/server";
import { Box, Card, CardContent, Chip, Divider, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from "@mui/material";
import { getInvoiceById } from "../data/get-invoices";
import { StatusBadge } from "../components/status-badge";
import { InvoiceActions } from "./components/invoice-actions";
import { PaymentList } from "./components/payment-list";
import { ActivityLog } from "./components/activity-log";

interface Props {
  params: Promise<{ invoiceId: string }>;
}

function formatDate(d: Date | string | null, locale: string) {
  if (!d) return "-";
  return new Date(d).toLocaleDateString(locale);
}

function formatCurrency(amount: string | number, currency: string, locale: string) {
  const num = typeof amount === "string" ? parseFloat(amount) : amount;
  if (isNaN(num)) return String(amount);
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: currency || "CZK",
    minimumFractionDigits: 2,
  }).format(num);
}

export default async function InvoiceDetailPage({ params }: Props) {
  const { invoiceId } = await params;
  const locale = await getLocale();
  const t = await getTranslations("InvoicesPage");
  const invoice = await getInvoiceById(invoiceId);

  if (!invoice) {
    notFound();
  }

  const statusLabels: Record<string, string> = {
    DRAFT: t("status.DRAFT"),
    ISSUED: t("status.ISSUED"),
    SENT: t("status.SENT"),
    PARTIALLY_PAID: t("status.PARTIALLY_PAID"),
    PAID: t("status.PAID"),
    OVERDUE: t("status.OVERDUE"),
    CANCELLED: t("status.CANCELLED"),
    DISPUTED: t("status.DISPUTED"),
    REFUNDED: t("status.REFUNDED"),
    WRITTEN_OFF: t("status.WRITTEN_OFF"),
  };

  const billing =
    (invoice.billingSnapshot as Record<string, string> | null) ?? {};
  const accountEmail =
    (invoice.account as { email?: string } | null)?.email ?? undefined;

  const detail = (label: string, value: ReactNode) => <Stack direction="row" key={label} sx={{ justifyContent: "space-between", gap: 2 }}><Typography variant="body2" color="text.secondary">{label}</Typography><Typography variant="body2" component="div" sx={{ textAlign: "right", overflowWrap: "anywhere" }}>{value}</Typography></Stack>;
  const money = (value: { toString(): string }) => formatCurrency(value.toString(), invoice.currency, locale);
  const cardTitle = (title: string) => <Box sx={{ p: 3, pb: 1.5 }}><Typography variant="h6" component="h2">{title}</Typography><Divider sx={{ mt: 2 }} /></Box>;

  return <Box sx={{ width: "100%", pb: 6 }}>
    <Stack direction={{ xs: "column", md: "row" }} spacing={2} sx={{ justifyContent: "space-between", alignItems: { md: "center" } }}>
      <Box><Stack direction="row" spacing={1.5} sx={{ alignItems: "center", flexWrap: "wrap" }}><Typography variant="h4" component="h1">{invoice.number ?? "DRAFT"}</Typography><Chip size="small" label={invoice.type} /><StatusBadge status={invoice.status} labels={statusLabels} /></Stack></Box>
      <InvoiceActions invoiceId={invoice.id} status={invoice.status} balanceDue={invoice.balanceDue.toString()} currency={invoice.currency} accountEmail={accountEmail} />
    </Stack>
    <Divider sx={{ my: 2 }} />
    <Stack spacing={2.5}>
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", lg: "1fr 1fr" }, gap: 2.5 }}>
        <Card variant="outlined">{cardTitle("Details")}<CardContent sx={{ pt: 1.5 }}><Stack spacing={1.5}>
          {detail(t("table.account"), invoice.account?.name ?? "-")}
          {billing.street && detail("Address", `${billing.street}${billing.city ? `, ${billing.city}` : ""}${billing.postalCode ? ` ${billing.postalCode}` : ""}`)}
          {detail(t("table.issueDate"), formatDate(invoice.issueDate, locale))}
          {detail(t("table.dueDate"), formatDate(invoice.dueDate, locale))}
          {invoice.variableSymbol && detail(t("form.variableSymbol"), invoice.variableSymbol)}
          {invoice.series && detail(t("form.series"), invoice.series.name)}
        </Stack></CardContent></Card>
        <Card variant="outlined">{cardTitle("Financial Summary")}<CardContent sx={{ pt: 1.5 }}><Stack spacing={1.5}>
          {detail("Subtotal", money(invoice.subtotal))}
          {parseFloat(invoice.discountTotal.toString()) > 0 && detail("Discount", <Box component="span" sx={{ color: "error.main" }}>-{money(invoice.discountTotal)}</Box>)}
          {detail("VAT", money(invoice.vatTotal))}
          <Divider />
          <Box sx={{ fontWeight: 600 }}>{detail("Grand Total", money(invoice.grandTotal))}</Box>
          {detail("Paid", <Box component="span" sx={{ color: "success.main" }}>{money(invoice.paidTotal)}</Box>)}
          <Box sx={{ fontWeight: 600 }}>{detail("Balance Due", money(invoice.balanceDue))}</Box>
          {invoice.bankName && <><Divider />{detail("Bank", invoice.bankName)}{invoice.iban && detail("IBAN", invoice.iban)}{invoice.swift && detail("SWIFT", invoice.swift)}</>}
        </Stack></CardContent></Card>
      </Box>
      <Card variant="outlined">{cardTitle(t("form.lineItems"))}<CardContent sx={{ pt: 1.5 }}>
        <TableContainer sx={{ border: 1, borderColor: "divider", borderRadius: 1 }}><Table aria-label="Invoice line items" sx={{ minWidth: 760, "& .MuiTableCell-head": { color: "text.secondary", fontSize: 14 }, "& .MuiTableCell-body": { fontSize: 14 } }}>
          <TableHead><TableRow><TableCell>#</TableCell><TableCell>{t("form.description")}</TableCell><TableCell align="right">{t("form.quantity")}</TableCell><TableCell align="right">{t("form.unitPrice")}</TableCell><TableCell align="right">{t("form.discount")}</TableCell><TableCell align="right">{t("form.taxRate")}</TableCell><TableCell align="right">{t("form.total")}</TableCell></TableRow></TableHead>
          <TableBody>{invoice.lineItems.map((line, index) => <TableRow key={line.id} hover>
            <TableCell sx={{ color: "text.secondary" }}>{index + 1}</TableCell>
            <TableCell><Typography variant="body2" sx={{ fontWeight: 600 }}>{line.description}</Typography>{line.product && <Typography variant="caption" color="text.secondary">({line.product.name})</Typography>}</TableCell>
            <TableCell align="right" sx={{ fontFamily: "monospace" }}>{line.quantity.toString()}</TableCell>
            <TableCell align="right" sx={{ fontFamily: "monospace" }}>{money(line.unitPrice)}</TableCell>
            <TableCell align="right">{parseFloat(line.discountPercent.toString()) > 0 ? `${line.discountPercent}%` : "-"}</TableCell>
            <TableCell align="right">{line.taxRate ? `${line.taxRate.name} (${line.taxRate.rate}%)` : "-"}</TableCell>
            <TableCell align="right" sx={{ fontFamily: "monospace", fontWeight: 600 }}>{money(line.lineTotal)}</TableCell>
          </TableRow>)}</TableBody>
        </Table></TableContainer>
      </CardContent></Card>
      {(invoice.publicNotes || invoice.internalNotes) && <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", lg: "1fr 1fr" }, gap: 2.5 }}>
        {invoice.publicNotes && <Card variant="outlined">{cardTitle(t("form.publicNotes"))}<CardContent sx={{ pt: 1.5 }}><Typography variant="body2" sx={{ whiteSpace: "pre-wrap" }}>{invoice.publicNotes}</Typography></CardContent></Card>}
        {invoice.internalNotes && <Card variant="outlined">{cardTitle(t("form.internalNotes"))}<CardContent sx={{ pt: 1.5 }}><Typography variant="body2" sx={{ whiteSpace: "pre-wrap" }}>{invoice.internalNotes}</Typography></CardContent></Card>}
      </Box>}
      <Card variant="outlined">{cardTitle("Payments")}<CardContent sx={{ pt: 1.5 }}><PaymentList payments={JSON.parse(JSON.stringify(invoice.payments))} currency={invoice.currency} locale={locale} /></CardContent></Card>
      <Card variant="outlined">{cardTitle("Activity")}<CardContent sx={{ pt: 1.5 }}><ActivityLog activities={JSON.parse(JSON.stringify(invoice.activity))} /></CardContent></Card>
    </Stack>
  </Box>;
}
