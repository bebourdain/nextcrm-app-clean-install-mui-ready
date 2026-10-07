"use client";

import { useEffect, useState } from "react";
import { format, isValid } from "date-fns";
import { useTranslations } from "next-intl";
import { Controller, type UseFormReturn } from "react-hook-form";
import {
  Alert,
  Autocomplete,
  Box,
  Button,
  MenuItem,
  Stack,
  TextField,
} from "@mui/material";

import { searchUsers } from "@/actions/user/search-users";
import { getUserById } from "@/actions/user/get-user-by-id";
import { searchAccounts } from "@/actions/crm/accounts/search-accounts";
import { getAccountById } from "@/actions/crm/accounts/get-account-by-id";

export type OpportunityFormValues = {
  id?: string;
  name: string;
  close_date: Date;
  delivery_deadline?: Date;
  description: string;
  type: string;
  sales_stage: string;
  budget: string;
  currency: string;
  expected_revenue: string;
  next_step: string;
  assigned_to: string;
  account: string;
  contact: string;
  campaign: string;
};

type Option = { id: string; name: string };
type ContactOption = { id: string; first_name: string | null; last_name: string };

type Props = {
  form: UseFormReturn<OpportunityFormValues>;
  mode: "create" | "update";
  saleTypes: Option[];
  saleStages: Option[];
  campaigns: Option[];
  currencies: { code: string; name: string; symbol: string }[];
  accounts?: Option[];
  contacts?: ContactOption[];
  selectedStage?: string;
  fixedAccountId?: string;
};

function dateValue(value: Date | undefined) {
  return value && isValid(value) ? format(value, "yyyy-MM-dd") : "";
}

function fromDateInput(value: string) {
  return value ? new Date(`${value}T00:00:00`) : undefined;
}

function RemotePicker({
  kind,
  value,
  onChange,
  label,
  disabled,
  error,
  helperText,
}: {
  kind: "user" | "account";
  value: string;
  onChange: (value: string) => void;
  label: string;
  disabled: boolean;
  error?: boolean;
  helperText?: string;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [options, setOptions] = useState<Option[]>([]);
  const [selected, setSelected] = useState<Option | null>(null);
  const [skip, setSkip] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query), 300);
    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    if (!value) return;
    let current = true;
    const load = async () => {
      try {
        const record = kind === "user" ? await getUserById(value) : await getAccountById(value);
        if (current) setSelected(record ? { id: record.id, name: record.name ?? "" } : null);
      } catch {
        if (current) setSelected(null);
      }
    };
    void load();
    return () => { current = false; };
  }, [kind, value]);

  useEffect(() => {
    if (!open) return;
    let current = true;
    const load = async () => {
      setLoading(true);
      try {
        const result = kind === "user"
          ? await searchUsers({ search: debouncedQuery, skip, take: 50 })
          : await searchAccounts({ search: debouncedQuery, skip, take: 50 });
        if (!current) return;
        const records = kind === "user" && "users" in result
          ? result.users
          : "accounts" in result ? result.accounts : [];
        const next = records.map((record) => ({ id: record.id, name: record.name ?? "" }));
        setOptions((previous) => skip === 0 ? next : [
          ...previous,
          ...next.filter((record) => !previous.some((existing) => existing.id === record.id)),
        ]);
        setHasMore(result.hasMore);
      } catch {
        if (current) setHasMore(false);
      } finally {
        if (current) setLoading(false);
      }
    };
    void load();
    return () => { current = false; };
  }, [kind, open, debouncedQuery, skip]);

  const selectedOption = options.find((option) => option.id === value)
    ?? (selected?.id === value ? selected : null);
  const visibleOptions = selectedOption && !options.some((option) => option.id === selectedOption.id)
    ? [selectedOption, ...options]
    : options;

  return (
    <Autocomplete<Option, false, false, false>
      fullWidth
      open={open}
      onOpen={() => setOpen(true)}
      onClose={() => setOpen(false)}
      options={visibleOptions}
      value={selectedOption}
      onChange={(_, option) => onChange(option?.id ?? "")}
      onInputChange={(_, next, reason) => {
        if (reason !== "input" && reason !== "clear") return;
        setQuery(next);
        setSkip(0);
        setOptions([]);
      }}
      getOptionLabel={(option) => option.name}
      isOptionEqualToValue={(option, chosen) => option.id === chosen.id}
      filterOptions={(items) => items}
      loading={loading}
      disabled={disabled}
      slotProps={{
        listbox: {
          onScroll: (event) => {
            const list = event.currentTarget;
            if (hasMore && !loading && list.scrollTop + list.clientHeight >= list.scrollHeight - 24) {
              setSkip((previous) => previous + 50);
            }
          },
        },
      }}
      renderInput={(params) => (
        <TextField {...params} label={label} error={error} helperText={helperText} />
      )}
    />
  );
}

export function MuiOpportunityFormFields({
  form,
  mode,
  saleTypes,
  saleStages,
  campaigns,
  currencies,
  accounts = [],
  contacts = [],
  selectedStage,
  fixedAccountId,
}: Props) {
  const t = useTranslations("CrmOpportunityForm");
  const c = useTranslations("Common");
  const disabled = form.formState.isSubmitting;

  const textField = (
    name: "name" | "description" | "budget" | "expected_revenue" | "next_step" | "contact",
    label: string,
    props: { type?: string; placeholder?: string; multiline?: boolean; rows?: number } = {},
  ) => (
    <Controller
      control={form.control}
      name={name}
      render={({ field, fieldState }) => (
        <TextField
          {...field}
          {...props}
          value={field.value ?? ""}
          label={label}
          fullWidth
          disabled={disabled}
          error={!!fieldState.error}
          helperText={fieldState.error?.message}
        />
      )}
    />
  );

  const selectField = (
    name: "type" | "sales_stage" | "currency" | "campaign",
    label: string,
    options: { value: string; label: string }[],
    placeholder: string,
  ) => (
    <Controller
      control={form.control}
      name={name}
      render={({ field, fieldState }) => (
        <TextField
          {...field}
          value={field.value ?? ""}
          select
          label={label}
          fullWidth
          disabled={disabled}
          error={!!fieldState.error}
          helperText={fieldState.error?.message}
        >
          <MenuItem value="">{placeholder}</MenuItem>
          {options.map((option) => (
            <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>
          ))}
        </TextField>
      )}
    />
  );

  return (
    <Stack spacing={2.5} sx={{ px: { xs: 2, md: 4 }, pb: 3 }}>
        {textField("name", t("name"), { placeholder: "New NextCRM functionality" })}
        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 2 }}>
          <Controller
            control={form.control}
            name="close_date"
            render={({ field, fieldState }) => (
              <TextField
                type="date"
                label={t("closeDate")}
                value={dateValue(field.value)}
                onChange={(event) => field.onChange(fromDateInput(event.target.value))}
                onBlur={field.onBlur}
                inputRef={field.ref}
                slotProps={{ inputLabel: { shrink: true }, htmlInput: { min: "1900-01-01" } }}
                disabled={disabled}
                error={!!fieldState.error}
                helperText={fieldState.error?.message}
                fullWidth
              />
            )}
          />
          <Controller
            control={form.control}
            name="delivery_deadline"
            render={({ field, fieldState }) => (
              <TextField
                type="date"
                label="Delivery deadline"
                value={dateValue(field.value)}
                onChange={(event) => field.onChange(fromDateInput(event.target.value))}
                onBlur={field.onBlur}
                inputRef={field.ref}
                slotProps={{ inputLabel: { shrink: true }, htmlInput: { min: "1900-01-01" } }}
                disabled={disabled}
                error={!!fieldState.error}
                helperText={fieldState.error?.message}
                fullWidth
              />
            )}
          />
        </Box>
        {textField("description", c("description"), { multiline: true, rows: 3, placeholder: "New NextCRM functionality" })}
        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 2 }}>
          <Stack spacing={2}>
            {selectField("type", t("salesType"), saleTypes.map((item) => ({ value: item.id, label: item.name })), t("salesTypePlaceholder"))}
            {!selectedStage && selectField("sales_stage", t("saleStage"), saleStages.map((item) => ({ value: item.id, label: item.name })), t("saleStagePlaceholder"))}
            {textField("budget", t("budget"), { type: "number", placeholder: "1000000" })}
            {selectField("currency", t("currency"), currencies.map((item) => ({ value: item.code, label: `${item.symbol} ${item.code} — ${item.name}` })), t("selectCurrency"))}
            {textField("expected_revenue", t("expectedRevenue"), { type: "number", placeholder: "500000" })}
            {textField("next_step", t("nextStep"), { multiline: true, rows: 3, placeholder: t("nextStepPlaceholder") })}
          </Stack>
          <Stack spacing={2}>
            <Controller
              control={form.control}
              name="assigned_to"
              render={({ field, fieldState }) => (
                <RemotePicker
                  kind="user"
                  value={field.value ?? ""}
                  onChange={field.onChange}
                  label={c("assignedTo")}
                  disabled={disabled}
                  error={!!fieldState.error}
                  helperText={fieldState.error?.message}
                />
              )}
            />
            <Controller
              control={form.control}
              name="account"
              render={({ field, fieldState }) => mode === "create" ? (
                <Autocomplete
                  options={accounts}
                  value={accounts.find((account) => account.id === field.value) ?? null}
                  onChange={(_, account) => field.onChange(account?.id ?? "")}
                  getOptionLabel={(account) => account.name}
                  isOptionEqualToValue={(account, selected) => account.id === selected.id}
                  disabled={disabled || !!fixedAccountId}
                  renderInput={(params) => (
                    <TextField {...params} label={t("assignedAccount")} error={!!fieldState.error} helperText={fieldState.error?.message} />
                  )}
                />
              ) : (
                <RemotePicker
                  kind="account"
                  value={field.value ?? ""}
                  onChange={field.onChange}
                  label={t("assignedAccount")}
                  disabled={disabled}
                  error={!!fieldState.error}
                  helperText={fieldState.error?.message}
                />
              )}
            />
            {mode === "create" ? (
              <Controller
                control={form.control}
                name="contact"
                render={({ field, fieldState }) => (
                  <Autocomplete
                    options={contacts}
                    value={contacts.find((contact) => contact.id === field.value) ?? null}
                    onChange={(_, contact) => field.onChange(contact?.id ?? "")}
                    getOptionLabel={(contact) => `${contact.first_name ?? ""} ${contact.last_name}`.trim()}
                    isOptionEqualToValue={(contact, selected) => contact.id === selected.id}
                    disabled={disabled}
                    renderInput={(params) => (
                      <TextField {...params} label="Assigned Contact" error={!!fieldState.error} helperText={fieldState.error?.message} />
                    )}
                  />
                )}
              />
            ) : textField("contact", "Assigned Contact", { placeholder: "Contact ID" })}
            {selectField("campaign", "From campaign", campaigns.map((item) => ({ value: item.id, label: item.name })), "Select a campaign")}
          </Stack>
        </Box>
        {form.formState.errors.root?.serverError && (
          <Alert severity="error" aria-live="polite">{form.formState.errors.root.serverError.message}</Alert>
        )}
        <Button
          variant="contained"
          type="submit"
          disabled={disabled}
          data-testid="opportunity-submit-btn"
        >
          {disabled ? c("savingData") : mode === "create" ? c("create") : c("update")}
        </Button>
    </Stack>
  );
}
