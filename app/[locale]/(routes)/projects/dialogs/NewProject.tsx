"use client";

import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, MenuItem, Stack, TextField } from "@mui/material";
import { createProject } from "@/actions/projects/create-project";

const schema = z.object({ title: z.string().min(3).max(255), description: z.string().min(3).max(500), visibility: z.string().min(3).max(255) });
type Values = z.infer<typeof schema>;

export default function NewProjectDialog() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const t = useTranslations("ProjectsPage");
  const { control, handleSubmit, reset, formState: { errors } } = useForm<Values>({ resolver: zodResolver(schema), defaultValues: { title: "", description: "", visibility: "" } });
  async function submit(data: Values) {
    setLoading(true);
    try {
      const result = await createProject(data);
      if (result?.error) toast.error(result.error);
      else toast.success(`New project: ${data.title}, created successfully`);
    } catch (error: any) { toast.error(error?.message); }
    finally { setLoading(false); setOpen(false); reset(); router.refresh(); }
  }
  return <><Button variant="contained" onClick={() => setOpen(true)}>{t("newProject.trigger")}</Button><Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm"><DialogTitle>{t("newProject.title")}</DialogTitle><DialogContent><DialogContentText sx={{ mb: 2 }}>{t("newProject.description")}</DialogContentText><Stack component="form" id="new-project-form" onSubmit={handleSubmit(submit)} spacing={2}>
    <Controller name="title" control={control} render={({ field }) => <TextField {...field} label={t("newProject.nameLabel")} placeholder={t("newProject.namePlaceholder")} error={!!errors.title} helperText={errors.title?.message} disabled={loading} required />} />
    <Controller name="description" control={control} render={({ field }) => <TextField {...field} label={t("newProject.descLabel")} placeholder={t("newProject.descPlaceholder")} error={!!errors.description} helperText={errors.description?.message} disabled={loading} multiline minRows={4} required />} />
    <Controller name="visibility" control={control} render={({ field }) => <TextField {...field} select label={t("newProject.visibilityLabel")} error={!!errors.visibility} helperText={errors.visibility?.message} disabled={loading} required><MenuItem value="public">{t("newProject.public")}</MenuItem><MenuItem value="private">{t("newProject.private")}</MenuItem></TextField>} />
  </Stack></DialogContent><DialogActions><Button onClick={() => setOpen(false)}>{t("newProject.cancel")}</Button><Button type="submit" form="new-project-form" variant="contained" disabled={loading}>{t("newProject.create")}</Button></DialogActions></Dialog></>;
}
