"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter, usePathname } from "@/i18n/navigation";
import { Box, MenuItem, TextField } from "@mui/material";
import { toast } from "sonner";
import { setLanguage } from "@/actions/user/set-language";

export function LanguageForm({ userId }: { userId: string }) {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [loading, setLoading] = useState(false);
  const t = useTranslations("LanguageSelector");
  const languages = [{ label: t("english"), value: "en" }, { label: t("czech"), value: "cz" }, { label: t("german"), value: "de" }, { label: t("ukrainian"), value: "uk" }];
  const change = async (language: string) => {
    setLoading(true);
    try {
      const result = await setLanguage({ userId, language });
      if (result.error) { toast.error(result.error); setLoading(false); return; }
      toast.success(t("changedTo", { language }));
      router.replace(pathname, { locale: language });
    } catch { toast.error(t("error")); setLoading(false); }
  };
  return <Box sx={{ maxWidth: 260 }}>
    <TextField select label={t("selectPlaceholder")} size="small" defaultValue={locale} onChange={(event) => void change(event.target.value)} disabled={loading} fullWidth>
      {languages.map((lang) => <MenuItem key={lang.value} value={lang.value}>{lang.label}</MenuItem>)}
    </TextField>
  </Box>;
}
