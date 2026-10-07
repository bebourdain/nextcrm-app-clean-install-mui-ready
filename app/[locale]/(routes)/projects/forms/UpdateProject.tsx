"use client";

import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button, MenuItem, Stack, TextField } from "@mui/material";
import { updateProject } from "@/actions/projects/update-project";

type Props = { initialData: any; openEdit: (value: boolean) => void };
const schema = z.object({ id: z.string(), title: z.string().min(3).max(255), description: z.string().min(3).max(500), visibility: z.string().min(3).max(255) });
type Values = z.infer<typeof schema>;

export default function UpdateProjectForm({ initialData, openEdit }: Props) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { control, handleSubmit, formState: { errors } } = useForm<Values>({ resolver: zodResolver(schema), defaultValues: initialData });
  async function submit(data: Values) {
    setLoading(true);
    try {
      const result = await updateProject(data);
      if (result?.error) toast.error(result.error);
      else toast.success(`Project: ${data.title}, update successfully`);
    } catch (error: any) { toast.error(error?.message); }
    finally { setLoading(false); openEdit(false); router.refresh(); }
  }
  return <Stack component="form" onSubmit={handleSubmit(submit)} spacing={2} sx={{ py: 2 }}>
    <Controller name="title" control={control} render={({ field }) => <TextField {...field} label="Project name" placeholder="Enter project name" error={!!errors.title} helperText={errors.title?.message} disabled={loading} required />} />
    <Controller name="description" control={control} render={({ field }) => <TextField {...field} label="Project description" placeholder="Enter project description" multiline rows={8} error={!!errors.description} helperText={errors.description?.message} disabled={loading} required />} />
    <Controller name="visibility" control={control} render={({ field }) => <TextField {...field} select label="Project visibility" error={!!errors.visibility} helperText={errors.visibility?.message} disabled={loading} required><MenuItem value="public">Public</MenuItem><MenuItem value="private">Private</MenuItem></TextField>} />
    <Stack direction="row" spacing={1} sx={{ justifyContent: "flex-end" }}><Button onClick={() => openEdit(false)}>Cancel</Button><Button type="submit" variant="contained" disabled={loading}>{loading ? "Updating…" : "Update"}</Button></Stack>
  </Stack>;
}
