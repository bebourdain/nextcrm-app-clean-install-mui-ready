"use client";

import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button, Stack, TextField } from "@mui/material";
import { createSection } from "@/actions/projects/create-section";

const schema = z.object({ title: z.string().min(3).max(255) });
type Values = z.infer<typeof schema>;
export default function NewSectionForm({ boardId, onClose }: { boardId: string; onClose: () => void }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { control, handleSubmit, reset, formState: { errors } } = useForm<Values>({ resolver: zodResolver(schema), defaultValues: { title: "" } });
  async function submit(data: Values) {
    setLoading(true);
    try { const result = await createSection({ boardId, title: data.title }); if (result?.error) toast.error(result.error); else toast.success(`New section: ${data.title}, created successfully`); }
    catch (error: any) { toast.error(error?.message); }
    finally { reset(); setLoading(false); router.refresh(); onClose(); }
  }
  return <Stack component="form" onSubmit={handleSubmit(submit)} spacing={2}><Controller name="title" control={control} render={({ field }) => <TextField {...field} label="Section name" placeholder="Enter section name" error={!!errors.title} helperText={errors.title?.message} disabled={loading} required />} /><Stack direction="row" spacing={1} sx={{ justifyContent: "flex-end" }}><Button onClick={onClose}>Cancel</Button><Button type="submit" variant="contained" disabled={loading}>{loading ? "Creating…" : "Create"}</Button></Stack></Stack>;
}
