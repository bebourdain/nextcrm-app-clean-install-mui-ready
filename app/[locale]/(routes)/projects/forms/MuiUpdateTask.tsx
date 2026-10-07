"use client";

import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button, MenuItem, Stack, TextField, Typography } from "@mui/material";
import { updateTask } from "@/actions/projects/update-task";
import { MuiUserSearch } from "../MuiUserSearch";

type Props = {
  boards: any;
  boardId?: string;
  initialData: any;
  onDone?: () => void;
};

const schema = z.object({
  title: z.string().min(3).max(255),
  user: z.string().min(3).max(255),
  dueDateAt: z.date(),
  priority: z.string().min(3).max(10),
  content: z.string().min(3).max(500),
  boardId: z.string().min(3).max(255).optional(),
});

type Values = z.infer<typeof schema>;

export default function MuiUpdateTaskForm({ boardId, initialData, onDone }: Props) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { control, handleSubmit, formState: { errors } } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: initialData.title ?? "",
      user: initialData.user ?? "",
      dueDateAt: initialData.dueDateAt ? new Date(initialData.dueDateAt) : undefined,
      priority: initialData.priority ?? "",
      content: initialData.content ?? "",
      boardId,
    },
  });

  async function submit(data: Values) {
    setLoading(true);
    try {
      const result = await updateTask({ taskId: initialData.id, ...data });
      if (result?.error) toast.error(result.error);
      else toast.success(`Task: ${data.title}, updated successfully`);
    } catch (error: any) {
      toast.error(error?.message);
    } finally {
      setLoading(false);
      onDone?.();
      router.refresh();
    }
  }

  return (
    <Stack component="form" onSubmit={handleSubmit(submit)} spacing={2} sx={{ width: "100%", py: 2 }}>
      <Controller
        name="title"
        control={control}
        render={({ field }) => (
          <TextField {...field} label={`Task - Id: ${initialData.id}`} placeholder="Enter task name" error={!!errors.title} helperText={errors.title?.message} disabled={loading} required />
        )}
      />
      <Controller
        name="content"
        control={control}
        render={({ field }) => (
          <TextField {...field} label="Task description" placeholder="Enter task description" multiline minRows={4} error={!!errors.content} helperText={errors.content?.message} disabled={loading} required />
        )}
      />
      <Controller
        name="dueDateAt"
        control={control}
        render={({ field }) => (
          <TextField
            type="date"
            label="Due date"
            value={field.value instanceof Date && !Number.isNaN(field.value.getTime()) ? format(field.value, "yyyy-MM-dd") : ""}
            onChange={(event) => field.onChange(event.target.value ? new Date(`${event.target.value}T12:00:00`) : undefined)}
            slotProps={{ inputLabel: { shrink: true }, htmlInput: { min: "1900-01-01" } }}
            error={!!errors.dueDateAt}
            helperText={errors.dueDateAt?.message}
            disabled={loading}
            required
          />
        )}
      />
      <Controller
        name="user"
        control={control}
        render={({ field }) => (
          <MuiUserSearch value={field.value ?? ""} onChange={field.onChange} placeholder="Select assigned user" disabled={loading} />
        )}
      />
      {errors.user && <Typography color="error" variant="caption">{errors.user.message}</Typography>}
      <Controller
        name="priority"
        control={control}
        render={({ field }) => (
          <TextField {...field} select label="Choose task priority" error={!!errors.priority} helperText={errors.priority?.message} disabled={loading} required>
            {["low", "normal", "medium", "high", "critical"].map((priority) => (
              <MenuItem key={priority} value={priority} sx={{ textTransform: "capitalize" }}>{priority}</MenuItem>
            ))}
          </TextField>
        )}
      />
      <Stack direction="row" sx={{ justifyContent: "flex-end" }}>
        <Button type="submit" variant="contained" disabled={loading}>{loading ? "Updating…" : "Update"}</Button>
      </Stack>
    </Stack>
  );
}
