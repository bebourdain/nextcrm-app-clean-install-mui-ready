import { Suspense } from "react";
import { Box, Divider, Stack } from "@mui/material";
import { MuiPageHeader } from "@/components/mui/MuiPageHeader";
import { DateRangePicker } from "./DateRangePicker";
import { FilterBar } from "./FilterBar";
import { ReportToolbar } from "./ReportToolbar";
import { SavedReportsDropdown } from "./SavedReportsDropdown";
import type { ReportCategory } from "@/actions/reports/types";

type Props = {
  title: string; description: string; category: ReportCategory; currentFilters: string;
  filterOptions?: { key: string; labelKey: string; options: { value: string; label: string }[] }[];
  children: React.ReactNode;
};

export function ReportPageLayout({ title, description, category, currentFilters, filterOptions, children }: Props) {
  return <Box sx={{ width: "100%", pb: 6 }}>
    <MuiPageHeader title={title} description={description} />
    <Divider sx={{ my: 2 }} />
    <Stack spacing={3}>
      <Stack direction={{ xs: "column", lg: "row" }} spacing={2} sx={{ alignItems: { lg: "center" }, justifyContent: "space-between" }}>
        <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} sx={{ alignItems: { sm: "center" } }}>
          <Suspense><DateRangePicker /></Suspense>
          <Suspense><SavedReportsDropdown category={category} /></Suspense>
        </Stack>
        <Suspense><ReportToolbar category={category} currentFilters={currentFilters} /></Suspense>
      </Stack>
      <Suspense><FilterBar category={category} filterOptions={filterOptions} /></Suspense>
      <Stack spacing={3}>{children}</Stack>
    </Stack>
  </Box>;
}
