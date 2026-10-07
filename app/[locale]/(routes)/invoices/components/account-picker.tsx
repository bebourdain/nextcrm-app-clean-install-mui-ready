"use client";

import { useEffect, useState } from "react";
import { Autocomplete, TextField } from "@mui/material";
import { searchAccounts } from "@/actions/crm/accounts/search-accounts";
import { getAccountById } from "@/actions/crm/accounts/get-account-by-id";

type Option = { id: string; name: string };

export function InvoiceAccountPicker({ value, onChange, label, disabled }: { value: string; onChange: (id: string) => void; label: string; disabled?: boolean }) {
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
    let active = true;
    void getAccountById(value).then((account) => {
      if (active && account) setSelected({ id: account.id, name: account.name ?? "" });
    }).catch(() => { if (active) setSelected(null); });
    return () => { active = false; };
  }, [value]);
  useEffect(() => {
    if (!open) return;
    let active = true;
    const load = async () => {
      setLoading(true);
      try {
        const result = await searchAccounts({ search: debouncedQuery, skip, take: 50 });
        if (!active) return;
        const next = result.accounts.map((account) => ({ id: account.id, name: account.name ?? "" }));
        setOptions((previous) => skip === 0 ? next : [...previous, ...next.filter((item) => !previous.some((existing) => existing.id === item.id))]);
        setHasMore(result.hasMore);
      } catch { if (active) setHasMore(false); }
      finally { if (active) setLoading(false); }
    };
    void load();
    return () => { active = false; };
  }, [open, debouncedQuery, skip]);

  const selectedOption = options.find((option) => option.id === value) ?? (selected?.id === value ? selected : null);
  return <Autocomplete<Option, false, false, false>
    fullWidth open={open} onOpen={() => setOpen(true)} onClose={() => setOpen(false)}
    options={selectedOption && !options.some((option) => option.id === selectedOption.id) ? [selectedOption, ...options] : options}
    value={selectedOption} onChange={(_, option) => onChange(option?.id ?? "")}
    onInputChange={(_, next, reason) => { if (reason === "input" || reason === "clear") { setQuery(next); setSkip(0); setOptions([]); } }}
    getOptionLabel={(option) => option.name} isOptionEqualToValue={(left, right) => left.id === right.id}
    filterOptions={(items) => items} loading={loading} disabled={disabled}
    slotProps={{ listbox: { onScroll: (event) => { const list = event.currentTarget; if (hasMore && !loading && list.scrollTop + list.clientHeight >= list.scrollHeight - 24) setSkip((current) => current + 50); } } }}
    renderInput={(params) => <TextField {...params} label={label} placeholder="Select account..." />}
  />;
}
