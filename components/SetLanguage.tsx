"use client";

import { useState, type MouseEvent } from "react";
import { Button, ListItemIcon, Menu, MenuItem } from "@mui/material";
import { Check, ChevronsUpDown } from "lucide-react";
import { toast } from "sonner";
import { useLocale, useTranslations } from "next-intl";
import { useRouter, usePathname } from "@/i18n/navigation";
import { setLanguage } from "@/actions/user/set-language";
import LoadingModal from "./modals/loading-modal";

export function SetLanguage({ userId }: { userId: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const locale = useLocale();
  const t = useTranslations("LanguageSelector");
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);
  const [isLoading, setIsLoading] = useState(false);

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
        toast.error(result.error);
        setIsLoading(false);
        return;
      }
      toast.success(t("changedTo", { language: language.value }));
      router.replace(pathname, { locale: language.value });
    } catch {
      toast.error(t("error"));
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
        endIcon={<ChevronsUpDown size={16} />}
        sx={{ display: { xs: "none", lg: "inline-flex" }, justifyContent: "space-between", width: 200, height: 40, color: "text.primary", borderColor: "divider" }}
      >
        {languages.find((language) => language.value === locale)?.label ?? "Select language"}
      </Button>
      <Menu anchorEl={anchor} open={Boolean(anchor)} onClose={() => setAnchor(null)}>
        {languages.map((language) => (
          <MenuItem key={language.value} selected={language.value === locale} onClick={() => selectLanguage(language)} sx={{ minWidth: 200 }}>
            <ListItemIcon><Check size={16} style={{ opacity: language.value === locale ? 1 : 0 }} /></ListItemIcon>
            {language.label}
          </MenuItem>
        ))}
      </Menu>
      {isLoading && <LoadingModal isOpen={isLoading} description={t("loadingModal")} />}
    </>
  );
}
