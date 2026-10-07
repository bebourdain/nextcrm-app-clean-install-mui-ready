"use client";

import { useState } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { ExpandLess, ExpandMore } from "@mui/icons-material";
import { Box, Button, Collapse, MenuItem, Paper, TextField } from "@mui/material";
import { useTranslations } from "next-intl";
import type { ReportCategory } from "@/actions/reports/types";

type FilterOption = { key: string; labelKey: string; options: { value: string; label: string }[] };
export function FilterBar({ filterOptions = [] }: { category: ReportCategory; filterOptions?: FilterOption[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const t = useTranslations("ReportsPage");
  const [expanded, setExpanded] = useState(false);

  const updateFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value === "all") params.delete(key);
    else params.set(key, value);
    router.push(`${pathname}?${params.toString()}`);
  };

  if (!filterOptions.length) return null;
  return <Paper variant="outlined" sx={{ p: 1.5 }}>
    <Button color="inherit" fullWidth endIcon={expanded ? <ExpandLess /> : <ExpandMore />} onClick={() => setExpanded((value) => !value)} sx={{ justifyContent: "space-between" }}>{t("filters")}</Button>
    <Collapse in={expanded}><Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", pt: 2 }}>
      {filterOptions.map((filter) => <TextField key={filter.key} select size="small" label={t(filter.labelKey)} value={searchParams.get(filter.key) ?? "all"} onChange={(event) => updateFilter(filter.key, event.target.value)} sx={{ minWidth: 180 }}>
        <MenuItem value="all">{t("all")}</MenuItem>
        {filter.options.map((option) => <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>)}
      </TextField>)}
    </Box></Collapse>
  </Paper>;
}
