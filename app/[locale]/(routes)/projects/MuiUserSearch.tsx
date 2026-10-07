"use client";

import { useEffect, useState } from "react";
import { Autocomplete, Button, Stack, TextField } from "@mui/material";
import useDebounce from "@/hooks/useDebounce";
import { searchUsers } from "@/actions/user/search-users";
import { getUserById } from "@/actions/user/get-user-by-id";

type User = { id: string; name: string | null; avatar: string | null };

export function MuiUserSearch({ value, onChange, placeholder = "Select user", disabled }: { value: string; onChange: (id: string) => void; placeholder?: string; disabled?: boolean }) {
  const [search, setSearch] = useState("");
  const [skip, setSkip] = useState(0);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(false);
  const debouncedSearch = useDebounce(search, 300);

  useEffect(() => {
    let live = true;
    Promise.resolve().then(() => { if (live) setLoading(true); });
    searchUsers({ search: debouncedSearch, skip, take: 50 }).then((result) => {
      if (!live) return;
      setUsers((previous) => skip === 0 ? result.users : [...previous, ...result.users]);
      setHasMore(result.hasMore);
    }).finally(() => { if (live) setLoading(false); });
    return () => { live = false; };
  }, [debouncedSearch, skip]);
  useEffect(() => {
    if (!value || users.some((user) => user.id === value) || selectedUser?.id === value) return;
    let live = true;
    getUserById(value).then((user) => { if (live) setSelectedUser(user); });
    return () => { live = false; };
  }, [value, users, selectedUser?.id]);

  const selected = value ? (users.find((user) => user.id === value) ?? (selectedUser?.id === value ? selectedUser : null)) : null;

  const options = selected && !users.some((user) => user.id === selected.id) ? [selected, ...users] : users;
  return <Stack spacing={1}><Autocomplete options={options} value={selected} inputValue={search} onInputChange={(_, next, reason) => { if (reason === "input" || reason === "clear") { setSearch(next); setSkip(0); setUsers([]); } }} onChange={(_, user) => { onChange(user?.id ?? ""); setSearch(user?.name ?? ""); }} getOptionLabel={(user) => user.name ?? user.id} isOptionEqualToValue={(a, b) => a.id === b.id} loading={loading} disabled={disabled} filterOptions={(items) => items} renderInput={(params) => <TextField {...params} label={placeholder} size="small" />} />{hasMore && <Button size="small" onClick={() => setSkip((previous) => previous + 50)} disabled={loading}>Load more users</Button>}</Stack>;
}
