"use client";

import { useEffect, useState } from "react";
import { Controller, type UseFormReturn } from "react-hook-form";
import { useTranslations } from "next-intl";
import { Alert, Autocomplete, Box, Button, MenuItem, Stack, TextField, Typography } from "@mui/material";
import { searchUsers } from "@/actions/user/search-users";
import { getUserById } from "@/actions/user/get-user-by-id";

export type AccountFormValues = {
  id?: string; name: string; office_phone?: string | null; website?: string | null; fax?: string | null;
  company_id?: string | null; vat?: string | null; email?: string | null;
  billing_street?: string | null; billing_postal_code?: string | null; billing_city?: string | null; billing_state?: string | null; billing_country?: string | null;
  shipping_street?: string | null; shipping_postal_code?: string | null; shipping_city?: string | null; shipping_state?: string | null; shipping_country?: string | null;
  description?: string | null; assigned_to?: string | null; status?: string | null; annual_revenue?: string | null; member_of?: string | null; industry?: string | null;
};
type Industry = { id: string; name: string };
type UserOption = { id: string; name: string };
type FieldName = Exclude<keyof AccountFormValues, "id">;

function UserPicker({ value, onChange, disabled }: { value: string; onChange: (id: string) => void; disabled: boolean }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [options, setOptions] = useState<UserOption[]>([]);
  const [selected, setSelected] = useState<UserOption | null>(null);
  const [loading, setLoading] = useState(false);
  const [skip, setSkip] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  useEffect(() => {
    if (!value) { setSelected(null); return; }
    let current = true;
    getUserById(value).then((user) => { if (current) setSelected(user ? { id: user.id, name: user.name || "" } : null); }).catch(() => { if (current) setSelected(null); });
    return () => { current = false; };
  }, [value]);
  useEffect(() => {
    if (!open) return;
    let current = true;
    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const result = await searchUsers({ search: query, skip, take: 50 });
        if (current) {
          const next = result.users.map((user) => ({ id: user.id, name: user.name || "" }));
          setOptions((previous) => skip === 0 ? next : [...previous, ...next.filter((user) => !previous.some((existing) => existing.id === user.id))]);
          setHasMore(result.hasMore);
        }
      } catch { if (current) setHasMore(false); }
      finally { if (current) setLoading(false); }
    }, 250);
    return () => { current = false; clearTimeout(timer); };
  }, [open, query, skip]);
  const chosen = options.find((option) => option.id === value) || (selected?.id === value ? selected : null);
  return <Autocomplete<UserOption, false, false, false> fullWidth open={open} onOpen={() => setOpen(true)} onClose={() => setOpen(false)} value={chosen} options={chosen && !options.some((option) => option.id === chosen.id) ? [chosen, ...options] : options} onChange={(_, option) => onChange(option?.id || "")} onInputChange={(_, text, reason) => { if (reason === "input" || reason === "clear") { setQuery(text); setSkip(0); setOptions([]); } }} getOptionLabel={(option) => option.name} isOptionEqualToValue={(a, b) => a.id === b.id} filterOptions={(items) => items} loading={loading} disabled={disabled} slotProps={{ listbox: { onScroll: (event) => { const list = event.currentTarget; if (hasMore && !loading && list.scrollTop + list.clientHeight >= list.scrollHeight - 24) setSkip((previous) => previous + 50); } } }} renderInput={(params) => <TextField {...params} label="Assigned to" />} />;
}

export function MuiAccountFormFields({ form, industries, mode }: { form: UseFormReturn<any>; industries: Industry[]; mode: "create" | "update" }) {
  const t = useTranslations("CrmAccountForm");
  const c = useTranslations("Common");
  const disabled = form.formState.isSubmitting;
  const field = (name: FieldName, label: string, placeholder?: string, multiline = false) => <Controller key={name} name={name} control={form.control} render={({ field: input, fieldState }) => <TextField fullWidth label={label} placeholder={placeholder} required={name === "name"} disabled={disabled} multiline={multiline} minRows={multiline ? 3 : undefined} value={input.value ?? ""} onChange={input.onChange} onBlur={input.onBlur} inputRef={input.ref} error={!!fieldState.error} helperText={fieldState.error?.message} />} />;
  const section = (title: string, names: [FieldName, string][]) => <Box key={title}><Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>{title}</Typography><Stack spacing={2}>{names.map(([name, label]) => field(name, label))}</Stack></Box>;
  return <Box sx={{ px: { xs: 2, md: 5 }, pb: 3 }}><Stack spacing={3}>
    {section("Account", [["name", t("accountName")], ["office_phone", t("officePhone")], ["email", t("email")], ["website", t("website")], ["company_id", t("accountId")], ["vat", t("vatNumber")]])}
    {section("Billing address", [["billing_street", t("billingStreet")], ["billing_postal_code", t("billingPostalCode")], ["billing_city", t("billingCity")], ["billing_state", t("billingState")], ["billing_country", t("billingCountry")]])}
    {section("Shipping address", [["shipping_street", t("shippingStreet")], ["shipping_postal_code", t("shippingPostalCode")], ["shipping_city", t("shippingCity")], ["shipping_state", t("shippingState")], ["shipping_country", t("shippingCountry")]])}
    <Box><Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>Details</Typography><Stack spacing={2}>
      {field("description", c("description"), undefined, true)}
      {field("annual_revenue", t("annualRevenue"))}
      {field("member_of", t("isMemberOf"))}
      <Controller name="industry" control={form.control} render={({ field: input, fieldState }) => <TextField select fullWidth label={t("industry")} value={input.value ?? ""} onChange={input.onChange} onBlur={input.onBlur} disabled={disabled} error={!!fieldState.error} helperText={fieldState.error?.message}><MenuItem value="">{t("industryPlaceholder")}</MenuItem>{industries.map((industry) => <MenuItem key={industry.id} value={industry.id}>{industry.name}</MenuItem>)}</TextField>} />
      <Controller name="assigned_to" control={form.control} render={({ field: input }) => <UserPicker value={input.value || ""} onChange={input.onChange} disabled={disabled} />} />
    </Stack></Box>
    {form.formState.errors.root?.serverError?.message && <Alert severity="error">{form.formState.errors.root.serverError.message}</Alert>}
    <Button variant="contained" type="submit" disabled={disabled} data-testid={mode === "create" ? "account-submit-btn" : undefined}>{disabled ? c("savingData") : mode === "create" ? t("createButton") : t("updateButton")}</Button>
  </Stack></Box>;
}
