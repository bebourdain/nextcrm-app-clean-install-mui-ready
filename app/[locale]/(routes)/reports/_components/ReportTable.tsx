"use client";

import { useState } from "react";
import { Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TableSortLabel, Typography } from "@mui/material";
import { useTranslations } from "next-intl";
import type { ChartDataPoint } from "@/actions/reports/types";

export function ReportTable({ data, titleKey, nameColumnKey = "name", valueColumnKey = "value" }: { data: ChartDataPoint[]; titleKey: string; nameColumnKey?: string; valueColumnKey?: string }) {
  const t = useTranslations("ReportsPage.charts");
  const [sortAsc, setSortAsc] = useState(false);
  const sorted = [...data].sort((a, b) => sortAsc ? a.Number - b.Number : b.Number - a.Number);
  return <Paper variant="outlined" sx={{ p: { xs: 2, sm: 3 } }}>
    <Typography variant="h6" sx={{ mb: 2 }}>{t(titleKey)}</Typography>
    <TableContainer><Table size="small">
      <TableHead><TableRow>
        <TableCell>{t(nameColumnKey)}</TableCell>
        <TableCell align="right"><TableSortLabel active direction={sortAsc ? "asc" : "desc"} onClick={() => setSortAsc((current) => !current)}>{t(valueColumnKey)}</TableSortLabel></TableCell>
      </TableRow></TableHead>
      <TableBody>{sorted.map((row) => <TableRow key={row.name} hover><TableCell>{row.name}</TableCell><TableCell align="right">{new Intl.NumberFormat("en-US").format(row.Number)}</TableCell></TableRow>)}</TableBody>
    </Table></TableContainer>
  </Paper>;
}
