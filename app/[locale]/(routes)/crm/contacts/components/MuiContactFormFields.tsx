"use client";

import { useEffect, useState } from "react";
import { Controller, type UseFormReturn } from "react-hook-form";
import { useTranslations } from "next-intl";
import { Autocomplete, Box, FormControlLabel, MenuItem, Stack, Switch, TextField } from "@mui/material";
import { searchUsers } from "@/actions/user/search-users";
import { getUserById } from "@/actions/user/get-user-by-id";
import { searchAccounts } from "@/actions/crm/accounts/search-accounts";
import { getAccountById } from "@/actions/crm/accounts/get-account-by-id";

type Option = { id: string; name: string };

function RemotePicker({ kind, value, onChange, label, disabled }: {
  kind: "user" | "account"; value: string; onChange: (value: string) => void; label: string; disabled: boolean;
}) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [options, setOptions] = useState<Option[]>([]);
  const [selected, setSelected] = useState<Option | null>(null);
  const [loading, setLoading] = useState(false);
  const [skip, setSkip] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  useEffect(() => {
    if (!value) { setSelected(null); return; }
    let active = true;
    const load = async () => {
      const record = kind === "user" ? await getUserById(value) : await getAccountById(value);
      if (active) setSelected(record ? { id: record.id, name: record.name ?? "" } : null);
    };
    void load();
    return () => { active = false; };
  }, [kind, value]);
  useEffect(() => {
    if (!open) return;
    let active = true;
    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const result = kind === "user"
          ? await searchUsers({ search: query, skip, take: 50 })
          : await searchAccounts({ search: query, skip, take: 50 });
        if (active) {
          const found = ("users" in result ? result.users : result.accounts).map((item) => ({ id: item.id, name: item.name ?? "" }));
          setOptions((previous) => skip === 0 ? found : [...previous, ...found.filter((item) => !previous.some((old) => old.id === item.id))]);
          setHasMore(result.hasMore);
        }
      } catch {
        if (active) setHasMore(false);
      } finally { if (active) setLoading(false); }
    }, 250);
    return () => { active = false; clearTimeout(timer); };
  }, [kind, open, query, skip]);
  const current = options.find((item) => item.id === value) ?? (selected?.id === value ? selected : null);
  const choices = current && !options.some((item) => item.id === current.id) ? [current, ...options] : options;
  return <Autocomplete<Option, false, false, false>
    fullWidth open={open} onOpen={() => setOpen(true)} onClose={() => setOpen(false)}
    options={choices} value={current} loading={loading} disabled={disabled}
    getOptionLabel={(option) => option.name} isOptionEqualToValue={(a, b) => a.id === b.id}
    filterOptions={(items) => items} onInputChange={(_, input, reason) => { if (reason === "input" || reason === "clear") { setQuery(input); setSkip(0); setOptions([]); } }}
    onChange={(_, option) => onChange(option?.id ?? "")}
    slotProps={{ listbox: { onScroll: (event) => {
      const list = event.currentTarget;
      if (hasMore && !loading && list.scrollTop + list.clientHeight >= list.scrollHeight - 24) setSkip((previous) => previous + 50);
    } } }}
    renderInput={(params) => <TextField {...params} label={label} />}
  />;
}

export function MuiContactFormFields({ form, mode, accounts = [], accountId, contactTypes = [] }: {
  form: UseFormReturn<any>; mode: "create" | "update"; accounts?: Option[]; accountId?: string; contactTypes?: Option[];
}) {
  const t = useTranslations("CrmContactForm");
  const c = useTranslations("Common");
  const disabled = form.formState.isSubmitting;
  const text = (name: string, label: string, placeholder?: string, multiline = false) => (
    <Controller key={name} control={form.control} name={name} render={({ field, fieldState }) =>
      <TextField {...field} value={field.value ?? ""} label={label} placeholder={placeholder} disabled={disabled}
        error={!!fieldState.error} helperText={fieldState.error?.message} multiline={multiline} rows={multiline ? 3 : undefined} fullWidth />}
    />
  );
  const currentYear = new Date().getFullYear();
  const dateSelect = (name: string, label: string, values: number[]) => (
    <Controller control={form.control} name={name} render={({ field }) =>
      <TextField select fullWidth label={label} value={field.value ?? ""} onChange={field.onChange} disabled={disabled}
        >
        <MenuItem value="">—</MenuItem>{values.map((value) => <MenuItem key={value} value={String(value)}>{value}</MenuItem>)}
      </TextField>}
    />
  );
  return <Stack spacing={2.5} sx={{ py: 1 }}>
    <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>{text("first_name", t("firstName"), "John")}{text("last_name", t("lastName"), "Doe")}</Stack>
    <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>{text("mobile_phone", t("mobilePhone"), "+11 1236 77 55")}{text("office_phone", t("officePhone"), "+11 1236 77 55")}</Stack>
    <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>{text("email", t("email"), "john@domain.com")}{text("personal_email", t("personalEmail"))}</Stack>
    <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>{dateSelect("birthday_year", t("year"), Array.from({ length: 110 }, (_, i) => currentYear - i))}{dateSelect("birthday_month", t("month"), Array.from({ length: 12 }, (_, i) => i + 1))}{dateSelect("birthday_day", t("day"), Array.from({ length: 31 }, (_, i) => i + 1))}</Stack>
    {text("description", c("description"), t("descriptionPlaceholder"), true)}
    <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
      <Controller control={form.control} name="assigned_to" render={({ field }) => <RemotePicker kind="user" value={field.value ?? ""} onChange={field.onChange} label={t("assignedUser")} disabled={disabled} />} />
      <Controller control={form.control} name="assigned_account" render={({ field }) => mode === "update"
        ? <RemotePicker kind="account" value={field.value ?? ""} onChange={field.onChange} label={t("assignAccount")} disabled={disabled} />
        : <TextField select fullWidth label={t("assignAccount")} value={field.value ?? ""} onChange={field.onChange} disabled={disabled || !!accountId}><MenuItem value="">—</MenuItem>{accounts.map((account) => <MenuItem key={account.id} value={account.id}>{account.name}</MenuItem>)}</TextField>} />
    </Stack>
    <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>{text("position", t("position"), "CTO")}{text("website", t("website"))}</Stack>
    <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ alignItems: "center" }}>
      <Controller control={form.control} name={mode === "create" ? "type" : "contact_type_id"} render={({ field }) => <TextField select fullWidth label={t("contactType")} value={field.value ?? ""} onChange={field.onChange} disabled={disabled}><MenuItem value="">—</MenuItem>{(mode === "create" ? [{ id: "Customer", name: t("customer") }, { id: "Partner", name: t("partner") }, { id: "Vendor", name: t("vendor") }] : contactTypes).map((item) => <MenuItem key={item.id} value={item.id}>{item.name}</MenuItem>)}</TextField>} />
      <Box sx={{ width: "100%" }}><Controller control={form.control} name="status" render={({ field }) => <FormControlLabel label={t("isActive")} control={<Switch checked={!!field.value} onChange={(_, checked) => field.onChange(checked)} disabled={disabled} />} />} /></Box>
    </Stack>
    <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>{text("social_twitter", "Twitter")}{text("social_facebook", "Facebook")}</Stack>
    <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>{text("social_linkedin", "LinkedIn")}{text("social_skype", "Skype")}</Stack>
    <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>{text("social_youtube", "YouTube")}{text("social_tiktok", "TikTok")}</Stack>
  </Stack>;
}
