"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Box, Button, CircularProgress, MenuItem, TextField } from "@mui/material";
import { toast } from "sonner";
import { inviteUser } from "@/actions/admin/users/invite-user";

const schema = z.object({
  name: z.string().min(3).max(50),
  email: z.string().email(),
  language: z.string({ message: "Please select a user language." }).min(2),
});
type Values = z.infer<typeof schema>;

export function InviteForm() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const t = useTranslations("AdminPage");
  const { control, handleSubmit, reset } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", email: "", language: "en" },
  });
  const submit = async (data: Values) => {
    setLoading(true);
    try {
      const result = await inviteUser(data);
      if (result.error) toast.error(result.error);
      else toast.success(t("inviteForm.invited"));
    } catch {
      toast.error(t("inviteForm.errorDesc"));
    } finally {
      reset({ name: "", email: "", language: "en" });
      router.refresh();
      setLoading(false);
    }
  };

  return <Box component="form" onSubmit={handleSubmit(submit)} sx={{ display: "grid", gap: 2, gridTemplateColumns: { xs: "1fr", md: "repeat(3, minmax(0, 1fr)) auto" }, alignItems: "start" }}>
    <Controller name="name" control={control} render={({ field, fieldState }) => <TextField {...field} label={t("inviteForm.name")} placeholder="jdoe" disabled={loading} error={!!fieldState.error} helperText={fieldState.error?.message} fullWidth size="small" />} />
    <Controller name="email" control={control} render={({ field, fieldState }) => <TextField {...field} label={t("inviteForm.email")} type="email" placeholder="name@domain.com" disabled={loading} error={!!fieldState.error} helperText={fieldState.error?.message} fullWidth size="small" />} />
    <Controller name="language" control={control} render={({ field, fieldState }) => <TextField {...field} select label="Language" disabled={loading} error={!!fieldState.error} helperText={fieldState.error?.message} fullWidth size="small"><MenuItem value="en">English</MenuItem><MenuItem value="cz">Czech</MenuItem></TextField>} />
    <Button type="submit" variant="contained" disabled={loading} startIcon={loading ? <CircularProgress size={16} color="inherit" /> : undefined} sx={{ minHeight: 40, whiteSpace: "nowrap" }}>Invite user</Button>
  </Box>;
}
