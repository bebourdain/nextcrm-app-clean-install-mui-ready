"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Box, Button, Drawer, Stack, TextField, Typography } from "@mui/material";
import { toast } from "sonner";
import { sendMailToAll } from "@/actions/admin/send-mail-to-all";
import { useAction } from "@/hooks/use-action";

export default function SendMailToAll() {
  const [open, setOpen] = useState(false);
  const t = useTranslations("AdminPage");
  const { execute, fieldErrors, isLoading } = useAction(sendMailToAll, {
    onSuccess: () => { toast.success(t("sendMail.sent")); setOpen(false); },
    onError: (error) => toast.error(error),
  });
  const submit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    void execute({ title: String(data.get("title") ?? ""), message: String(data.get("message") ?? "") });
  };
  return <>
    <Button variant="outlined" onClick={() => setOpen(true)}>{t("sendMail.trigger")}</Button>
    <Drawer anchor="right" open={open} onClose={() => setOpen(false)} slotProps={{ paper: { sx: { width: { xs: "100%", sm: 560 }, p: 3 } } }}>
      <Stack spacing={1} sx={{ mb: 3 }}><Typography variant="h6">{t("sendMail.title")}</Typography><Typography color="text.secondary">{t("sendMail.description")}</Typography></Stack>
      <Box component="form" onSubmit={submit}><Stack spacing={2}>
        <TextField name="title" label={t("sendMail.messageTitle")} error={!!fieldErrors?.title} helperText={fieldErrors?.title?.join(", ")} fullWidth />
        <TextField name="message" label={t("sendMail.message")} placeholder={t("sendMail.message")} multiline minRows={6} required error={!!fieldErrors?.message} helperText={fieldErrors?.message?.join(", ")} fullWidth />
        <Stack direction="row" sx={{ justifyContent: "flex-end" }} spacing={1}><Button onClick={() => setOpen(false)} disabled={isLoading}>Cancel</Button><Button type="submit" variant="contained" disabled={isLoading}>{isLoading ? "Sending..." : t("sendMail.sendButton")}</Button></Stack>
      </Stack></Box>
    </Drawer>
  </>;
}
