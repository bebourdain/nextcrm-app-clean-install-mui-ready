"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Box, Button, Divider, MenuItem, Stack, TextField, Typography } from "@mui/material";
import { toast } from "sonner";
import { saveInvoiceSettings } from "../_actions/invoice-settings";
import type { FieldErrors, InvoiceSettingsInput } from "../_actions/invoice-settings";

interface Currency { code: string; name: string }
interface Series { id: string; name: string }
interface TaxRate { id: string; name: string; rate: string }
interface Settings {
  id: string; baseCurrency: string; defaultSeriesId: string | null; defaultTaxRateId: string | null;
  defaultDueDays: number; bankName: string | null; bankAccount: string | null; iban: string | null;
  swift: string | null; footerText: string | null; companyName: string | null; companyAddress: string | null;
  companyCity: string | null; companyZip: string | null; companyCountry: string | null; companyVatId: string | null;
  companyTaxId: string | null; companyRegNo: string | null; companyEmail: string | null;
  companyPhone: string | null; companyWebsite: string | null;
}
interface Props { settings: Settings | null; currencies: Currency[]; series: Series[]; taxRates: TaxRate[] }
type Field = "baseCurrency" | "defaultSeriesId" | "defaultTaxRateId" | "defaultDueDays" | "bankName" |
  "bankAccount" | "iban" | "swift" | "footerText" | "companyName" | "companyAddress" |
  "companyCity" | "companyZip" | "companyCountry" | "companyVatId" | "companyTaxId" |
  "companyRegNo" | "companyEmail" | "companyPhone" | "companyWebsite";
type Values = Record<Field, string>;

export function InvoiceSettingsForm({ settings, currencies, series, taxRates }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [errors, setErrors] = useState<FieldErrors>({});
  const [values, setValues] = useState<Values>(() => ({
    baseCurrency: settings?.baseCurrency ?? "CZK",
    defaultSeriesId: settings?.defaultSeriesId ?? "",
    defaultTaxRateId: settings?.defaultTaxRateId ?? "",
    defaultDueDays: settings?.defaultDueDays?.toString() ?? "14",
    bankName: settings?.bankName ?? "", bankAccount: settings?.bankAccount ?? "",
    iban: settings?.iban ?? "", swift: settings?.swift ?? "", footerText: settings?.footerText ?? "",
    companyName: settings?.companyName ?? "", companyAddress: settings?.companyAddress ?? "",
    companyCity: settings?.companyCity ?? "", companyZip: settings?.companyZip ?? "",
    companyCountry: settings?.companyCountry ?? "", companyVatId: settings?.companyVatId ?? "",
    companyTaxId: settings?.companyTaxId ?? "", companyRegNo: settings?.companyRegNo ?? "",
    companyEmail: settings?.companyEmail ?? "", companyPhone: settings?.companyPhone ?? "",
    companyWebsite: settings?.companyWebsite ?? "",
  }));

  const change = (field: Field, value: string) => {
    setValues((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev }; delete next[field]; return next;
    });
  };
  const field = (key: Field, label: string, options?: { required?: boolean; placeholder?: string; type?: string; multiline?: boolean; rows?: number }) =>
    <TextField
      key={key} label={label} value={values[key]} onChange={(event) => change(key, event.target.value)}
      required={options?.required} placeholder={options?.placeholder} type={options?.type}
      multiline={options?.multiline} rows={options?.rows} fullWidth size="small"
      error={!!errors[key]} helperText={errors[key] ?? ""}
      slotProps={key === "defaultDueDays" ? { htmlInput: { min: 1 } } : undefined}
    />;

  const handleSave = () => {
    const payload: InvoiceSettingsInput = {
      baseCurrency: values.baseCurrency,
      defaultSeriesId: values.defaultSeriesId || null,
      defaultTaxRateId: values.defaultTaxRateId || null,
      defaultDueDays: parseInt(values.defaultDueDays) || 14,
      bankName: values.bankName || null, bankAccount: values.bankAccount || null,
      iban: values.iban || null, swift: values.swift || null, footerText: values.footerText || null,
      companyName: values.companyName, companyAddress: values.companyAddress,
      companyCity: values.companyCity, companyZip: values.companyZip,
      companyCountry: values.companyCountry, companyRegNo: values.companyRegNo,
      companyVatId: values.companyVatId || null, companyTaxId: values.companyTaxId || null,
      companyEmail: values.companyEmail || null, companyPhone: values.companyPhone || null,
      companyWebsite: values.companyWebsite || null,
    };
    setErrors({});
    startTransition(async () => {
      const res = await saveInvoiceSettings(payload);
      if (res.ok) { toast.success("Settings saved"); router.refresh(); }
      else { toast.error(res.error); if (res.fieldErrors) setErrors(res.fieldErrors); }
    });
  };

  return <Stack spacing={3} sx={{ maxWidth: 820 }}>
    <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Company Details</Typography>
    {field("companyName", "Company Name", { required: true, placeholder: "e.g. Acme s.r.o." })}
    {field("companyAddress", "Street Address", { required: true, placeholder: "e.g. Wenceslas Square 1" })}
    <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "repeat(3, 1fr)" }, gap: 2 }}>
      {field("companyCity", "City", { required: true })}
      {field("companyZip", "ZIP / Postal Code", { required: true })}
      {field("companyCountry", "Country", { required: true, placeholder: "e.g. Czech Republic" })}
      {field("companyVatId", "VAT ID (DIČ)", { placeholder: "e.g. CZ12345678" })}
      {field("companyTaxId", "Tax ID")}
      {field("companyRegNo", "Registration No. (IČO)", { required: true, placeholder: "e.g. 12345678" })}
      {field("companyEmail", "Email", { type: "email" })}
      {field("companyPhone", "Phone")}
      {field("companyWebsite", "Website", { placeholder: "e.g. https://acme.com" })}
    </Box>
    <Divider />
    <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Invoice Defaults</Typography>
    <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)" }, gap: 2 }}>
      <TextField select size="small" label="Base Currency" value={values.baseCurrency} onChange={(event) => change("baseCurrency", event.target.value)} fullWidth>
        {currencies.map((currency) => <MenuItem key={currency.code} value={currency.code}>{currency.code} - {currency.name}</MenuItem>)}
      </TextField>
      {field("defaultDueDays", "Default Due Days", { type: "number" })}
      <TextField select size="small" label="Default Series" value={values.defaultSeriesId} onChange={(event) => change("defaultSeriesId", event.target.value)} fullWidth>
        <MenuItem value="">None</MenuItem>{series.map((item) => <MenuItem key={item.id} value={item.id}>{item.name}</MenuItem>)}
      </TextField>
      <TextField select size="small" label="Default Tax Rate" value={values.defaultTaxRateId} onChange={(event) => change("defaultTaxRateId", event.target.value)} fullWidth>
        <MenuItem value="">None</MenuItem>{taxRates.map((item) => <MenuItem key={item.id} value={item.id}>{item.name} ({item.rate}%)</MenuItem>)}
      </TextField>
      {field("bankName", "Bank Name", { placeholder: "e.g. Komercni banka" })}
      {field("bankAccount", "Bank Account", { placeholder: "e.g. 123456789/0100" })}
      {field("iban", "IBAN", { placeholder: "e.g. CZ6508000000192000145399" })}
      {field("swift", "SWIFT", { placeholder: "e.g. KOMBCZPP" })}
    </Box>
    {field("footerText", "Footer Text", { multiline: true, rows: 3, placeholder: "Text displayed at the bottom of invoices" })}
    <Box><Button variant="contained" onClick={handleSave} disabled={isPending}>{isPending ? "Saving..." : "Save Settings"}</Button></Box>
  </Stack>;
}
