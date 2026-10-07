"use client";

import { useEffect, useState } from "react";
import { Autocomplete, Alert, Box, Button, MenuItem, Stack, TextField } from "@mui/material";
import { searchUsers } from "@/actions/user/search-users";
import { getUserById } from "@/actions/user/get-user-by-id";

type Option = { id: string; name: string };
type Currency = { code: string; name: string; symbol: string };
type FieldErrors = Record<string, string[] | undefined>;

export type ContractFormData = {
  title?: string;
  value?: string | number | null;
  currency?: string | null;
  startDate?: Date | string | null;
  endDate?: Date | string | null;
  renewalReminderDate?: Date | string | null;
  customerSignedDate?: Date | string | null;
  companySignedDate?: Date | string | null;
  description?: string | null;
  account?: string | null;
  assigned_to?: string | null;
  status?: string | null;
};

function dateValue(value: Date | string | null | undefined) {
  if (!value) return "";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "" : date.toISOString().slice(0, 10);
}

function AssignedUser({ value, onChange, disabled, error }: { value: string; onChange: (id: string) => void; disabled: boolean; error?: string }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [options, setOptions] = useState<Option[]>([]);
  const [selected, setSelected] = useState<Option | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!value) return;
    let active = true;
    void getUserById(value).then((user) => {
      if (active && user) setSelected({ id: user.id, name: user.name ?? "" });
    });
    return () => { active = false; };
  }, [value]);

  useEffect(() => {
    if (!open) return;
    let active = true;
    const timer = setTimeout(() => {
      setLoading(true);
      void searchUsers({ search: query, skip: 0, take: 50 }).then((result) => {
        if (active) setOptions(result.users.map((user) => ({ id: user.id, name: user.name ?? "" })));
      }).finally(() => { if (active) setLoading(false); });
    }, 250);
    return () => { active = false; clearTimeout(timer); };
  }, [open, query]);

  const selectedOption = options.find((option) => option.id === value) ?? (selected?.id === value ? selected : null);
  return (
    <Autocomplete<Option, false, false, false>
      options={selectedOption && !options.some((option) => option.id === selectedOption.id) ? [selectedOption, ...options] : options}
      value={selectedOption}
      onChange={(_, option) => onChange(option?.id ?? "")}
      onInputChange={(_, next, reason) => { if (reason === "input" || reason === "clear") setQuery(next); }}
      onOpen={() => setOpen(true)} onClose={() => setOpen(false)} open={open}
      getOptionLabel={(option) => option.name}
      isOptionEqualToValue={(left, right) => left.id === right.id}
      filterOptions={(items) => items}
      loading={loading} disabled={disabled}
      renderInput={(params) => <TextField {...params} label="Assigned To" error={!!error} helperText={error} />}
    />
  );
}

export function ContractFormFields({
  mode, data, accounts, currencies, fixedAccountId, assignedTo, onAssignedToChange, fieldErrors, isLoading, onAction,
}: {
  mode: "create" | "update";
  data?: ContractFormData;
  accounts: Option[];
  currencies: Currency[];
  fixedAccountId?: string;
  assignedTo: string;
  onAssignedToChange: (id: string) => void;
  fieldErrors: FieldErrors;
  isLoading: boolean;
  onAction: (formData: FormData) => Promise<void>;
}) {
  const error = (field: string) => ({ error: !!fieldErrors[field]?.length, helperText: fieldErrors[field]?.join(", ") });
  const dates = [
    { name: "startDate", label: "Start Date" },
    { name: "endDate", label: "End Date" },
    { name: "renewalReminderDate", label: "Renewal Reminder Date" },
    { name: "customerSignedDate", label: "Customer Signed Date" },
    { name: "companySignedDate", label: "Company Signed Date" },
  ] as const;
  return (
    <Box component="form" action={onAction} sx={{ px: { xs: 2, md: 4 }, pb: 3 }}>
      <Stack spacing={2.5}>
        <TextField name="title" label="Title" defaultValue={data?.title ?? ""} disabled={isLoading} required fullWidth {...error("title")} slotProps={{ htmlInput: { minLength: 3, maxLength: 255 } }} />
        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 2 }}>
          <TextField name="value" label="Value" type="number" defaultValue={data?.value == null ? "" : String(data.value)} disabled={isLoading} fullWidth {...error("value")} slotProps={{ htmlInput: { step: "any" } }} />
          <TextField name="currency" label="Currency" select defaultValue={data?.currency ?? ""} disabled={isLoading} fullWidth {...error("currency")}>
            <MenuItem value="">Select currency</MenuItem>
            {currencies.map((currency) => <MenuItem key={currency.code} value={currency.code}>{currency.symbol} {currency.code} — {currency.name}</MenuItem>)}
          </TextField>
        </Box>
        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 2 }}>
          {dates.map(({ name, label }) => <TextField key={name} name={name} label={label} type="date" defaultValue={dateValue(data?.[name])} disabled={isLoading} fullWidth {...error(name)} slotProps={{ inputLabel: { shrink: true } }} />)}
        </Box>
        <TextField name="description" label="Description" multiline minRows={3} defaultValue={data?.description ?? ""} disabled={isLoading} fullWidth {...error("description")} slotProps={{ htmlInput: { maxLength: 255 } }} />
        {mode === "update" && <TextField name="status" label="Status" select defaultValue={data?.status ?? "NOTSTARTED"} disabled={isLoading} fullWidth {...error("status")}>
          <MenuItem value="NOTSTARTED">Not started</MenuItem><MenuItem value="INPROGRESS">In progress</MenuItem><MenuItem value="SIGNED">Signed</MenuItem>
        </TextField>}
        <TextField name={fixedAccountId ? undefined : "account"} label="Account" select defaultValue={fixedAccountId ?? data?.account ?? ""} disabled={isLoading || !!fixedAccountId} fullWidth {...error("account")}>
          <MenuItem value="">Select account</MenuItem>
          {accounts.map((account) => <MenuItem key={account.id} value={account.id}>{account.name}</MenuItem>)}
        </TextField>
        {fixedAccountId && <input type="hidden" name="account" value={fixedAccountId} />}
        <AssignedUser value={assignedTo} onChange={onAssignedToChange} disabled={isLoading} error={fieldErrors.assigned_to?.join(", ")} />
        <input type="hidden" name="assigned_to" value={assignedTo} />
        {fieldErrors._form && <Alert severity="error">{fieldErrors._form.join(", ")}</Alert>}
        <Button type="submit" variant="contained" disabled={isLoading} data-testid="contract-submit-btn">{isLoading ? "Saving..." : mode === "create" ? "Create" : "Update"}</Button>
      </Stack>
    </Box>
  );
}
