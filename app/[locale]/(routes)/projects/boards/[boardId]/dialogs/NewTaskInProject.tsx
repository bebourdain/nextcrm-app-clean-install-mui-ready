"use client";

import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";

import { toast } from "sonner";
import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, MenuItem, Stack, TextField } from "@mui/material";
import { MuiUserSearch } from "../../../MuiUserSearch";
import { createTaskInBoard } from "@/actions/projects/create-task-in-board";

const schema = z.object({ title: z.string().min(3).max(255), user: z.string().min(3).max(255), section: z.string().min(3).max(255), priority: z.string().min(3).max(10), content: z.string().min(3).max(500), dueDateAt: z.date() });
type Values = z.infer<typeof schema>;
export default function NewTaskDialog({ boardId, sections }: { boardId: string; sections: { id: string; title: string }[] }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const { control, handleSubmit, reset, formState: { errors } } = useForm<Values>({ resolver: zodResolver(schema), defaultValues: { title: "", content: "", user: "", section: "", priority: "", dueDateAt: new Date() } });
  async function submit(data: Values) {
    setLoading(true);
    try { const result = await createTaskInBoard({ boardId, section: data.section, title: data.title, priority: data.priority, content: data.content, user: data.user, dueDateAt: data.dueDateAt }); if (result?.error) toast.error(result.error); else toast.success(`New task: ${data.title}, created successfully`); }
    catch (error: any) { toast.error(error?.message); }
    finally { setLoading(false); setOpen(false); reset(); router.refresh(); }
  }
  return <><Button variant="contained" onClick={() => setOpen(true)}>Create new task</Button><Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm"><DialogTitle>Create New Task</DialogTitle><DialogContent><DialogContentText sx={{ mb: 2 }}>Fill out the form below to create a new task.</DialogContentText><Stack component="form" id="new-task-form" onSubmit={handleSubmit(submit)} spacing={2}>
    <Controller name="title" control={control} render={({ field }) => <TextField {...field} label="Task name" error={!!errors.title} helperText={errors.title?.message} disabled={loading} required />} />
    <Controller name="content" control={control} render={({ field }) => <TextField {...field} label="Task description" multiline minRows={3} error={!!errors.content} helperText={errors.content?.message} disabled={loading} required />} />
    <Controller name="dueDateAt" control={control} render={({ field }) => <TextField type="date" label="Due date" value={field.value ? new Date(field.value).toISOString().slice(0, 10) : ""} onChange={(event) => field.onChange(new Date(`${event.target.value}T12:00:00`))} slotProps={{ inputLabel: { shrink: true } }} error={!!errors.dueDateAt} helperText={errors.dueDateAt?.message} disabled={loading} required />} />
    <Controller name="user" control={control} render={({ field }) => <MuiUserSearch value={field.value ?? ""} onChange={field.onChange} placeholder="Assigned to" disabled={loading} />} />
    {errors.user && <span role="alert">{errors.user.message}</span>}
    <Controller name="section" control={control} render={({ field }) => <TextField {...field} select label="Choose section" error={!!errors.section} helperText={errors.section?.message} disabled={loading} required>{sections.map((item) => <MenuItem key={item.id} value={item.id}>{item.title}</MenuItem>)}</TextField>} />
    <Controller name="priority" control={control} render={({ field }) => <TextField {...field} select label="Priority" error={!!errors.priority} helperText={errors.priority?.message} disabled={loading} required>{["low", "medium", "high", "critical"].map((priority) => <MenuItem key={priority} value={priority} sx={{ textTransform: "capitalize" }}>{priority}</MenuItem>)}</TextField>} />
  </Stack></DialogContent><DialogActions><Button onClick={() => setOpen(false)}>Cancel</Button><Button type="submit" form="new-task-form" variant="contained" disabled={loading}>Create</Button></DialogActions></Dialog></>;
}
