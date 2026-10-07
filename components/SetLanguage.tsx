"use client";

import { useEffect, useState, type MouseEvent } from "react";
import { Button, CircularProgress, Dialog, DialogContent, DialogTitle, ListItemIcon, Menu, MenuItem } from "@mui/material";
import CheckIcon from "@mui/icons-material/Check";
import UnfoldMoreIcon from "@mui/icons-material/UnfoldMore";
import { useLocale, useTranslations } from "next-intl";
import { useRouter, usePathname } from "@/i18n/navigation";
import { setLanguage } from "@/actions/user/set-language";
import { MuiHeaderNotice, type HeaderNotice } from "./mui/MuiHeaderNotice";

const LANGUAGE_NOTICE_KEY = "nextcrm-language-notice";

export function SetLanguage({ userId }: { userId: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const locale = useLocale();
  const t = useTranslations("LanguageSelector");
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [notice, setNotice] = useState<HeaderNotice | null>(null);

  useEffect(() => {
    const message = window.sessionStorage.getItem(LANGUAGE_NOTICE_KEY);
    if (!message) return;
    const timeout = window.setTimeout(() => {
      window.sessionStorage.removeItem(LANGUAGE_NOTICE_KEY);
      setNotice({ message, severity: "success" });
    }, 0);
    return () => window.clearTimeout(timeout);
  }, []);

  const languages = [
    { label: t("english"), value: "en" },
    { label: t("czech"), value: "cz" },
    { label: t("german"), value: "de" },
    { label: t("ukrainian"), value: "uk" },
  ] as const;

  const openMenu = (event: MouseEvent<HTMLElement>) => setAnchor(event.currentTarget);

  async function selectLanguage(language: (typeof languages)[number]) {
    setAnchor(null);
    if (language.value === locale) return;
    setIsLoading(true);
    try {
      const result = await setLanguage({ userId, language: language.value });
      if (result.error) {
        setNotice({ message: result.error, severity: "error" });
        setIsLoading(false);
        return;
      }
      const message = t("changedTo", { language: language.value });
      window.sessionStorage.setItem(LANGUAGE_NOTICE_KEY, message);
      setNotice({ message, severity: "success" });
      setIsLoading(false);
      router.replace(pathname, { locale: language.value });
    } catch {
      setNotice({ message: t("error"), severity: "error" });
      setIsLoading(false);
    }
  }

  return (
    <>
      <Button
        variant="outlined"
        onClick={openMenu}
        aria-label="Language"
        aria-haspopup="menu"
        aria-expanded={Boolean(anchor)}
        endIcon={<UnfoldMoreIcon sx={{ fontSize: 18 }} />}
        sx={{ display: { xs: "none", lg: "inline-flex" }, justifyContent: "space-between", width: 200, height: 40, color: "text.primary", borderColor: "divider" }}
      >
        {languages.find((language) => language.value === locale)?.label ?? "Select language"}
      </Button>
      <Menu anchorEl={anchor} open={Boolean(anchor)} onClose={() => setAnchor(null)}>
        {languages.map((language) => (
          <MenuItem key={language.value} selected={language.value === locale} onClick={() => selectLanguage(language)} sx={{ minWidth: 200 }}>
            <ListItemIcon><CheckIcon sx={{ fontSize: 18, opacity: language.value === locale ? 1 : 0 }} /></ListItemIcon>
            {language.label}
          </MenuItem>
        ))}
      </Menu>
      <Dialog open={isLoading} aria-labelledby="language-loading-title" maxWidth="xs" fullWidth>
        <DialogTitle id="language-loading-title">{t("loadingModal")}</DialogTitle>
        <DialogContent sx={{ display: "flex", justifyContent: "center", py: 3 }}>
          <CircularProgress aria-label={t("loadingModal")} />
        </DialogContent>
      </Dialog>
      <MuiHeaderNotice notice={notice} onClose={() => {
        window.sessionStorage.removeItem(LANGUAGE_NOTICE_KEY);
        setNotice(null);
      }} />
    </>
  );
}
