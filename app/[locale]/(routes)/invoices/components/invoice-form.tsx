"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import { toast } from "sonner";
import { Box, Button, Divider, MenuItem, Paper, Stack, TextField, Typography } from "@mui/material";
import { LineItemsEditor, LineItemRow } from "./line-items-editor";
import { TotalsPanel } from "./totals-panel";
import { InvoiceAccountPicker } from "./account-picker";
import { INVOICE_TYPES } from "@/types/invoice";
import { createInvoice } from "@/actions/invoices/create-invoice";
import { updateInvoice } from "@/actions/invoices/update-invoice";

interface Product {
  id: string;
  name: string;
}

interface TaxRate {
  id: string;
  name: string;
  rate: string;
}

interface Series {
  id: string;
  name: string;
}

interface Currency {
  code: string;
  name: string;
}

interface Settings {
  baseCurrency: string;
  defaultSeriesId: string | null;
  defaultTaxRateId: string | null;
  defaultDueDays: number;
  bankName: string | null;
  iban: string | null;
  swift: string | null;
}

interface InvoiceFormProps {
  products: Product[];
  taxRates: TaxRate[];
  series: Series[];
  currencies: Currency[];
  settings: Settings | null;
  labels?: Record<string, string>;
  /** Existing invoice data for edit mode */
  initialData?: {
    id: string;
    type: string;
    accountId: string;
    seriesId: string | null;
    currency: string;
    dueDate: string | null;
    bankName: string | null;
    iban: string | null;
    swift: string | null;
    variableSymbol: string | null;
    publicNotes: string | null;
    internalNotes: string | null;
    lineItems: Array<{
      productId: string | null;
      description: string;
      quantity: string;
      unitPrice: string;
      discountPercent: string;
      taxRateId: string | null;
    }>;
  };
}

export function InvoiceForm({
  products,
  taxRates,
  series,
  currencies,
  settings,
  labels,
  initialData,
}: InvoiceFormProps) {
  const router = useRouter();
  const locale = useLocale();
  const [saving, setSaving] = useState(false);
  const isEdit = !!initialData;

  const [type, setType] = useState(initialData?.type ?? "INVOICE");
  const [accountId, setAccountId] = useState(initialData?.accountId ?? "");
  const [seriesId, setSeriesId] = useState(
    initialData?.seriesId ?? settings?.defaultSeriesId ?? ""
  );
  const [currency, setCurrency] = useState(
    initialData?.currency ?? settings?.baseCurrency ?? "CZK"
  );
  const [dueDate, setDueDate] = useState(() => {
    if (initialData?.dueDate) {
      return new Date(initialData.dueDate).toISOString().split("T")[0];
    }
    if (settings?.defaultDueDays) {
      const d = new Date();
      d.setDate(d.getDate() + settings.defaultDueDays);
      return d.toISOString().split("T")[0];
    }
    return "";
  });
  const [bankName, setBankName] = useState(
    initialData?.bankName ?? settings?.bankName ?? ""
  );
  const [iban, setIban] = useState(
    initialData?.iban ?? settings?.iban ?? ""
  );
  const [swift, setSwift] = useState(
    initialData?.swift ?? settings?.swift ?? ""
  );
  const [variableSymbol, setVariableSymbol] = useState(
    initialData?.variableSymbol ?? ""
  );
  const [publicNotes, setPublicNotes] = useState(
    initialData?.publicNotes ?? ""
  );
  const [internalNotes, setInternalNotes] = useState(
    initialData?.internalNotes ?? ""
  );

  const defaultTaxRateId = settings?.defaultTaxRateId ?? "";

  const [lineItems, setLineItems] = useState<LineItemRow[]>(() => {
    if (initialData?.lineItems?.length) {
      return initialData.lineItems.map((li) => ({
        productId: li.productId ?? "",
        description: li.description,
        quantity: parseFloat(li.quantity) || 1,
        unitPrice: parseFloat(li.unitPrice) || 0,
        discountPercent: parseFloat(li.discountPercent) || 0,
        taxRateId: li.taxRateId ?? "",
      }));
    }
    return [
      {
        productId: "",
        description: "",
        quantity: 1,
        unitPrice: 0,
        discountPercent: 0,
        taxRateId: defaultTaxRateId,
      },
    ];
  });

  const getTaxRateValue = (taxRateId: string) => {
    const tr = taxRates.find((t) => t.id === taxRateId);
    return tr ? parseFloat(tr.rate) : 0;
  };

  const totalsInput = lineItems.map((li) => ({
    quantity: li.quantity,
    unitPrice: li.unitPrice,
    discountPercent: li.discountPercent,
    taxRate: getTaxRateValue(li.taxRateId),
  }));

  const handleSubmit = async () => {
    if (!accountId) {
      toast.error("Please select an account");
      return;
    }
    if (lineItems.length === 0 || !lineItems.some((l) => l.description)) {
      toast.error("At least one line item is required");
      return;
    }

    setSaving(true);
    try {
      const body = {
        type,
        accountId,
        seriesId: seriesId || null,
        currency,
        dueDate: dueDate ? new Date(dueDate).toISOString() : null,
        bankName: bankName || null,
        iban: iban || null,
        swift: swift || null,
        variableSymbol: variableSymbol || null,
        publicNotes: publicNotes || null,
        internalNotes: internalNotes || null,
        lineItems: lineItems
          .filter((l) => l.description)
          .map((l, i) => ({
            position: i,
            productId: l.productId || null,
            description: l.description,
            quantity: l.quantity,
            unitPrice: l.unitPrice,
            discountPercent: l.discountPercent,
            taxRateId: l.taxRateId || null,
          })),
      };

      const result = isEdit
        ? await updateInvoice(initialData.id, body)
        : await createInvoice(body);

      toast.success(isEdit ? "Invoice updated" : "Invoice created");
      router.push(`/invoices/${result.id}`);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to save invoice"
      );
    } finally {
      setSaving(false);
    }
  };

  const l = labels ?? {};

  return (
    <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", lg: "minmax(0, 1fr) 300px" }, gap: 3 }}>
      <Stack spacing={3}>
        <Paper variant="outlined" sx={{ p: 3, borderRadius: "var(--radius)" }}>
          <Typography variant="h6" component="h2" sx={{ mb: 2 }}>Invoice details</Typography>
          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "repeat(2, minmax(0, 1fr))", md: "repeat(3, minmax(0, 1fr))" }, gap: 2 }}>
            <TextField select label={l.type ?? "Type"} value={type} onChange={(event) => setType(event.target.value)} disabled={saving} fullWidth>
              {INVOICE_TYPES.map((item) => <MenuItem key={item} value={item}>{item.replace("_", " ")}</MenuItem>)}
            </TextField>
            <InvoiceAccountPicker value={accountId} onChange={setAccountId} label={l.account ?? "Account"} disabled={saving} />
            <TextField select label={l.series ?? "Series"} value={seriesId} onChange={(event) => setSeriesId(event.target.value)} disabled={saving} fullWidth>
              <MenuItem value="">-</MenuItem>{series.map((item) => <MenuItem key={item.id} value={item.id}>{item.name}</MenuItem>)}
            </TextField>
            <TextField select label={l.currency ?? "Currency"} value={currency} onChange={(event) => setCurrency(event.target.value)} disabled={saving} fullWidth>
              {currencies.map((item) => <MenuItem key={item.code} value={item.code}>{item.code} - {item.name}</MenuItem>)}
            </TextField>
            <TextField type="date" label={l.dueDate ?? "Due Date"} value={dueDate} onChange={(event) => setDueDate(event.target.value)} disabled={saving} fullWidth slotProps={{ inputLabel: { shrink: true } }} />
            <TextField label={l.variableSymbol ?? "Variable Symbol"} value={variableSymbol} onChange={(event) => setVariableSymbol(event.target.value)} disabled={saving} fullWidth />
            <TextField label={l.bankName ?? "Bank Name"} value={bankName} onChange={(event) => setBankName(event.target.value)} disabled={saving} fullWidth />
            <TextField label={l.iban ?? "IBAN"} value={iban} onChange={(event) => setIban(event.target.value)} disabled={saving} fullWidth />
            <TextField label={l.swift ?? "SWIFT"} value={swift} onChange={(event) => setSwift(event.target.value)} disabled={saving} fullWidth />
          </Box>
        </Paper>
        <Paper variant="outlined" sx={{ p: 3, borderRadius: "var(--radius)" }}>
          <Typography variant="h6" component="h2" sx={{ mb: 2 }}>{l.lineItems ?? "Line Items"}</Typography>
          <LineItemsEditor items={lineItems} onChange={setLineItems} products={products} taxRates={taxRates} labels={{ product: l.product, description: l.description, quantity: l.quantity, unitPrice: l.unitPrice, discount: l.discount, taxRate: l.taxRate, total: l.total, addLine: l.addLine }} />
        </Paper>
        <Paper variant="outlined" sx={{ p: 3, borderRadius: "var(--radius)" }}>
          <Typography variant="h6" component="h2" sx={{ mb: 2 }}>Notes</Typography>
          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 2 }}>
            <TextField label={l.publicNotes ?? "Public Notes"} value={publicNotes} onChange={(event) => setPublicNotes(event.target.value)} multiline minRows={3} disabled={saving} fullWidth />
            <TextField label={l.internalNotes ?? "Internal Notes"} value={internalNotes} onChange={(event) => setInternalNotes(event.target.value)} multiline minRows={3} disabled={saving} fullWidth />
          </Box>
        </Paper>
        <Divider />
        <Stack direction="row" spacing={1.5}>
          <Button variant="contained" onClick={handleSubmit} disabled={saving} data-testid="invoice-submit-btn">{saving ? "Saving..." : isEdit ? "Update Draft" : (l.save ?? "Save Draft")}</Button>
          <Button variant="outlined" onClick={() => router.back()} disabled={saving}>Cancel</Button>
        </Stack>
      </Stack>
      <Box><TotalsPanel lineItems={totalsInput} currency={currency} locale={locale} /></Box>
    </Box>
  );
}
