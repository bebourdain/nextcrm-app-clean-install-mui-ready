"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import type { Users } from "@prisma/client";
import { Box, Button, TextField } from "@mui/material";
import { toast } from "sonner";
import { updateProfile } from "@/actions/user/update-profile";

const schema = z.object({ id: z.string(), name: z.string().min(3).max(50), username: z.string().min(2).max(50), account_name: z.string().min(2).max(50) });
type Values = z.infer<typeof schema>;
export function ProfileForm({ data }: { data: Users }) {
  const [loading, setLoading] = useState(false);
  const t = useTranslations("ProfileForm");
  const router = useRouter();
  const { control, handleSubmit } = useForm<Values>({ resolver: zodResolver(schema), defaultValues: { id: data.id, name: data.name ?? "", username: data.username ?? "", account_name: data.account_name ?? "" } });
  const submit = async (values: Values) => {
    setLoading(true);
    try {
      const result = await updateProfile({ userId: values.id, name: values.name, username: values.username, account_name: values.account_name });
      if (result.error) { toast.error(result.error); return; }
      toast.success("Profile saved successfully"); router.refresh();
    } catch { toast.error("Something went wrong while activating your notion integration."); }
    finally { setLoading(false); }
  };
  return <Box component="form" onSubmit={handleSubmit(submit)} sx={{ display: "grid", gap: 2, gridTemplateColumns: { xs: "1fr", md: "repeat(3, minmax(0, 1fr)) auto" }, alignItems: "start" }}>
    <Controller name="name" control={control} render={({ field, fieldState }) => <TextField {...field} label={t("fullName")} placeholder="John Doe" disabled={loading} error={!!fieldState.error} helperText={fieldState.error?.message} fullWidth size="small" />} />
    <Controller name="username" control={control} render={({ field, fieldState }) => <TextField {...field} label={t("username")} placeholder="jdoe" disabled={loading} error={!!fieldState.error} helperText={fieldState.error?.message} fullWidth size="small" />} />
    <Controller name="account_name" control={control} render={({ field, fieldState }) => <TextField {...field} label={t("company")} placeholder="Tesla Inc.," disabled={loading} error={!!fieldState.error} helperText={fieldState.error?.message} fullWidth size="small" />} />
    <Button type="submit" variant="contained" disabled={loading} sx={{ minHeight: 40 }}>{t("updateButton")}</Button>
  </Box>;
}
