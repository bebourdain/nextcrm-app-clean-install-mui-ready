"use client";

import { useEffect, useState } from "react";
import { Controller, type Control, type FieldValues, type Path } from "react-hook-form";
import { useTranslations } from "next-intl";
import { Alert, Autocomplete, Box, Button, MenuItem, Stack, TextField } from "@mui/material";
import { searchUsers } from "@/actions/user/search-users";
import { getUserById } from "@/actions/user/get-user-by-id";
import { searchAccounts } from "@/actions/crm/accounts/search-accounts";
import { getAccountById } from "@/actions/crm/accounts/get-account-by-id";

type Option = { id: string; name: string };

function RemotePicker({ kind, value, onChange, label, disabled }: { kind: "user" | "account"; value: string; onChange: (value: string) => void; label: string; disabled: boolean }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [debounced, setDebounced] = useState("");
  const [options, setOptions] = useState<Option[]>([]);
  const [selected, setSelected] = useState<Option | null>(null);
  const [skip, setSkip] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => { const timer = setTimeout(() => setDebounced(query), 300); return () => clearTimeout(timer); }, [query]);
  useEffect(() => {
    if (!value) return;
    let active = true;
    void (async () => {
      const record = kind === "user" ? await getUserById(value) : await getAccountById(value);
      if (active) setSelected(record ? { id: record.id, name: record.name ?? "" } : null);
    })();
    return () => { active = false; };
  }, [kind, value]);
  useEffect(() => {
    if (!open) return;
    let active = true;
    setLoading(true);
    void (async () => {
      try {
        const result = kind === "user" ? await searchUsers({ search: debounced, skip, take: 50 }) : await searchAccounts({ search: debounced, skip, take: 50 });
        if (!active) return;
        const rows = kind === "user" && "users" in result ? result.users : "accounts" in result ? result.accounts : [];
        const next = rows.map((row) => ({ id: row.id, name: row.name ?? "" }));
        setOptions((previous) => skip === 0 ? next : [...previous, ...next.filter((row) => !previous.some((item) => item.id === row.id))]);
        setHasMore(result.hasMore);
      } finally { if (active) setLoading(false); }
    })();
    return () => { active = false; };
  }, [kind, open, debounced, skip]);

  const chosen = options.find((option) => option.id === value) ?? (selected?.id === value ? selected : null);
  const visible = chosen && !options.some((option) => option.id === chosen.id) ? [chosen, ...options] : options;
  return <Autocomplete<Option, false, false, false>
    fullWidth open={open} onOpen={() => setOpen(true)} onClose={() => setOpen(false)}
    options={visible} value={chosen} onChange={(_, option) => onChange(option?.id ?? "")}
    onInputChange={(_, next, reason) => { if (reason === "input" || reason === "clear") { setQuery(next); setSkip(0); setOptions([]); } }}
    getOptionLabel={(option) => option.name} isOptionEqualToValue={(option, chosenOption) => option.id === chosenOption.id}
    filterOptions={(items) => items} loading={loading} disabled={disabled}
    slotProps={{ listbox: { onScroll: (event) => { const list = event.currentTarget; if (hasMore && !loading && list.scrollTop + list.clientHeight >= list.scrollHeight - 24) setSkip((old) => old + 50); } } }}
    renderInput={(params) => <TextField {...params} label={label} />}
  />;
}

export function MuiLeadFormFields<T extends FieldValues>({ control, submitting, errors, submitLabel, leadSources, leadStatuses, leadTypes, mode, fixedAccountId }: {
  control: Control<T>;
  submitting: boolean;
  errors?: string;
  submitLabel: string;
  leadSources: Option[];
  leadStatuses: Option[];
  leadTypes: Option[];
  mode: "create" | "update";
  fixedAccountId?: string;
}) {
  const t = useTranslations("CrmLeadForm");
  const c = useTranslations("Common");
  const name = (create: string, update: string) => (mode === "create" ? create : update) as Path<T>;
  const text = (fieldName: Path<T>, label: string, placeholder?: string, multiline?: boolean) => <Controller control={control} name={fieldName} render={({ field, fieldState }) => <TextField {...field} value={field.value ?? ""} label={label} placeholder={placeholder} multiline={multiline} rows={multiline ? 3 : undefined} fullWidth disabled={submitting} error={!!fieldState.error} helperText={fieldState.error?.message} />} />;
  const select = (fieldName: Path<T>, label: string, options: Option[]) => <Controller control={control} name={fieldName} render={({ field, fieldState }) => <TextField {...field} value={field.value ?? ""} label={label} select fullWidth disabled={submitting} error={!!fieldState.error} helperText={fieldState.error?.message}><MenuItem value="">—</MenuItem>{options.map((option) => <MenuItem key={option.id} value={option.id}>{option.name}</MenuItem>)}</TextField>} />;
  const remote = (fieldName: Path<T>, label: string, kind: "user" | "account", disabled = false) => <Controller control={control} name={fieldName} render={({ field }) => <RemotePicker kind={kind} value={field.value ?? ""} onChange={field.onChange} label={label} disabled={submitting || disabled} />} />;
  return <Stack spacing={2.5} sx={{ px: { xs: 2, md: 4 }, pb: 3 }}>
    <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 2 }}>{text(name("first_name", "firstName"), t("firstName"), "Johny")}{text(name("last_name", "lastName"), t("lastName"), "Walker")}</Box>
    <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 2 }}>{text("company" as Path<T>, t("company"), "NextCRM Inc.")}{text("jobTitle" as Path<T>, t("jobTitle"), "CTO")}</Box>
    <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 2 }}>{text("email" as Path<T>, t("email"), "johny@domain.com")}{text("phone" as Path<T>, t("phone"), "+11 123 456 789")}</Box>
    {text("description" as Path<T>, c("description"), "New NextCRM functionality", true)}
    <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 2 }}>{select("lead_source_id" as Path<T>, t("leadSource"), leadSources)}{text("refered_by" as Path<T>, t("referredBy"), "Johny Walker")}</Box>
    <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 2 }}>{text("campaign" as Path<T>, t("campaign"), "Social networks")}{select("lead_type_id" as Path<T>, "Lead Type", leadTypes)}</Box>
    <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 2 }}>{remote("assigned_to" as Path<T>, c("assignedTo"), "user")}{select("lead_status_id" as Path<T>, "Lead Status", leadStatuses)}</Box>
    {remote(name("accountIDs", "accountsIDs"), t("assignAccount"), "account", !!fixedAccountId)}
    {errors && <Alert severity="error" role="alert">{errors}</Alert>}
    <Button type="submit" variant="contained" disabled={submitting} data-testid={mode === "create" ? "lead-submit-btn" : undefined}>{submitting ? c("savingData") : submitLabel}</Button>
  </Stack>;
}
