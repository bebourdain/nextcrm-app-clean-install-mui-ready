"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { MenuItem, TextField } from "@mui/material";
import { useTranslations } from "next-intl";
import { loadConfigs } from "@/actions/reports/config";
import type { ReportCategory } from "@/actions/reports/types";

type Config = { id: string; name: string; filters: Record<string, string>; isShared: boolean };

export function SavedReportsDropdown({ category }: { category: ReportCategory }) {
  const t = useTranslations("ReportsPage.savedReports");
  const router = useRouter();
  const pathname = usePathname();
  const [configs, setConfigs] = useState<Config[]>([]);
  const [selectedId, setSelectedId] = useState("");

  useEffect(() => {
    loadConfigs(category).then((result) => setConfigs(result.map((config) => ({
      id: config.id, name: config.name, filters: config.filters as Record<string, string>, isShared: config.isShared,
    }))));
  }, [category]);

  const selectConfig = (id: string) => {
    setSelectedId(id);
    const config = configs.find((item) => item.id === id);
    if (config) router.push(`${pathname}?${new URLSearchParams(config.filters).toString()}`);
  };

  if (!configs.length) return null;
  return <TextField select size="small" label={t("placeholder")} value={selectedId} onChange={(event) => selectConfig(event.target.value)} sx={{ minWidth: 200 }}>
    {configs.map((config) => <MenuItem key={config.id} value={config.id}>{config.name} {config.isShared ? `(${t("shared")})` : ""}</MenuItem>)}
  </TextField>;
}
