"use client";

import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Stack, TextField } from "@mui/material";
import { createSection } from "@/actions/projects/create-section";

const schema = z.object({ title: z.string().min(3).max(255) });
type Values = z.infer<typeof schema>;
export default function NewSectionDialog({ boardId }: { boardId: string }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const t = useTranslations("ProjectsPage");
  const { control, handleSubmit, reset, formState: { errors } } = useForm<Values>({ resolver: zodResolver(schema), defaultValues: { title: "" } });
  async function submit(data: Values) {
    setLoading(true);
    try { const result = await createSection({ boardId, title: data.title }); if (result?.error) toast.error(result.error); else toast.success(`New section: ${data.title}, created successfully`); }
    catch (error: any) { toast.error(error?.message); }
    finally { reset(); setLoading(false); setOpen(false); router.refresh(); }
  }
  return <><Button variant="contained" onClick={() => setOpen(true)}>{t("newSection.trigger")}</Button><Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="xs"><DialogTitle>{t("newSection.title")}</DialogTitle><DialogContent><DialogContentText sx={{ mb: 2 }}>{t("newSection.description")}</DialogContentText><Stack component="form" id="new-section-form" onSubmit={handleSubmit(submit)}><Controller name="title" control={control} render={({ field }) => <TextField {...field} label={t("newSection.nameLabel")} placeholder={t("newSection.namePlaceholder")} error={!!errors.title} helperText={errors.title?.message} disabled={loading} required />} /></Stack></DialogContent><DialogActions><Button onClick={() => setOpen(false)}>{t("newSection.cancel")}</Button><Button type="submit" form="new-section-form" variant="contained" disabled={loading}>{t("newSection.create")}</Button></DialogActions></Dialog></>;
}
