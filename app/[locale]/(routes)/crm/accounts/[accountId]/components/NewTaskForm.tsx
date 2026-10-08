"use client";

import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { z } from "zod";
import { useRouter } from "next/navigation";
import type { crm_Accounts } from "@prisma/client";
import { Autocomplete, Button, MenuItem, Stack, TextField, Typography } from "@mui/material";
import { toast } from "sonner";
import useDebounce from "@/hooks/useDebounce";
import { searchUsers } from "@/actions/user/search-users";
import { createTask } from "@/actions/crm/accounts/create-task";

type User = { id: string; name: string | null; avatar: string | null };
const schema = z.object({
  title: z.string().min(3).max(255),
  user: z.string().min(3).max(255),
  account: z.string(),
  dueDateAt: z.date().optional(),
  priority: z.string().min(3).max(10),
  content: z.string().min(3).max(500),
});
type Values = z.infer<typeof schema>;

function AssigneeSearch({ value, onChange, disabled }: { value: string; onChange: (id: string) => void; disabled: boolean }) {
  const [search, setSearch] = useState("");
  const [skip, setSkip] = useState(0);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const debouncedSearch = useDebounce(search, 300);
  useEffect(() => {
    let live = true;
    searchUsers({ search: debouncedSearch, skip, take: 50 }).then((result) => {
      if (!live) return;
      setUsers((previous) => skip === 0 ? result.users : [...previous, ...result.users]);
      setHasMore(result.hasMore);
    });
    return () => { live = false; };
  }, [debouncedSearch, skip]);
  const selected = value ? users.find((user) => user.id === value) ?? selectedUser : null;
  const options = selected && !users.some((user) => user.id === selected.id) ? [selected, ...users] : users;
  return <Stack spacing={0.5}><Autocomplete options={options} value={selected} onInputChange={(_, next, reason) => { if (reason === "input" || reason === "clear") { setSearch(next); setSkip(0); setUsers([]); } }} onChange={(_, user) => { setSelectedUser(user); onChange(user?.id ?? ""); }} getOptionLabel={(user) => user.name ?? user.id} isOptionEqualToValue={(a, b) => a.id === b.id} filterOptions={(items) => items} disabled={disabled} renderInput={(params) => <TextField {...params} size="small" label="Assigned to" placeholder="Select assigned user" />} />{hasMore && <Button size="small" onClick={() => setSkip((previous) => previous + 50)}>Load more users</Button>}</Stack>;
}

export default function NewTaskForm({ account, onFinish }: { account: crm_Accounts | null; onFinish: () => void }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { control, handleSubmit, formState: { errors } } = useForm<Values>({ resolver: zodResolver(schema), defaultValues: { title: "", content: "", user: "", priority: "", account: account?.id || "" } });
  async function submit(data: Values) {
    setLoading(true);
    try { const result = await createTask(data); if (result?.error) toast.error(result.error); else toast.success(`New task: ${data.title}, created successfully`); }
    catch (error: any) { toast.error(error?.message ?? "Something went wrong while creating the task"); }
    finally { setLoading(false); onFinish(); router.refresh(); }
  }
  return <Stack component="form" onSubmit={handleSubmit(submit)} spacing={2} sx={{ width: "100%" }}><Controller name="title" control={control} render={({ field }) => <TextField {...field} label="New task name" placeholder="Enter task name" error={!!errors.title} helperText={errors.title?.message} disabled={loading} required />} /><Controller name="content" control={control} render={({ field }) => <TextField {...field} label="Task description" placeholder="Enter task description" multiline minRows={4} error={!!errors.content} helperText={errors.content?.message} disabled={loading} required />} /><Controller name="dueDateAt" control={control} render={({ field }) => <TextField type="date" label="Task due date" value={field.value ? format(field.value, "yyyy-MM-dd") : ""} onChange={(event) => field.onChange(event.target.value ? new Date(`${event.target.value}T12:00:00`) : undefined)} slotProps={{ inputLabel: { shrink: true } }} error={!!errors.dueDateAt} helperText={errors.dueDateAt?.message} disabled={loading} />} /><Controller name="user" control={control} render={({ field }) => <AssigneeSearch value={field.value ?? ""} onChange={field.onChange} disabled={loading} />} />{errors.user && <Typography variant="caption" color="error">{errors.user.message}</Typography>}<Controller name="priority" control={control} render={({ field }) => <TextField {...field} select label="Choose task priority" error={!!errors.priority} helperText={errors.priority?.message} disabled={loading} required>{[["low", "Low"], ["medium", "Medium"], ["high", "High"], ["critical", "Critical"]].map(([value, label]) => <MenuItem key={value} value={value}>{label}</MenuItem>)}</TextField>} /><Stack direction="row" spacing={1} sx={{ justifyContent: "flex-end" }}><Button type="button" color="error" onClick={onFinish}>Close</Button><Button type="submit" variant="contained" disabled={loading}>{loading ? "Creating…" : "Create"}</Button></Stack></Stack>;
}
