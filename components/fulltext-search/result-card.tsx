"use client";

import Link from "next/link";
import { Box, Chip, Paper, Stack, Typography } from "@mui/material";
import type { SearchResult } from "@/actions/fulltext/unified-search";

const matchTypeLabel: Record<SearchResult["matchType"], string> = {
  keyword: "Keyword", semantic: "Semantic", both: "Best Match",
};
const matchTypeColor: Record<SearchResult["matchType"], "default" | "info" | "primary"> = {
  keyword: "default", semantic: "info", both: "primary",
};

export function ResultCard({ result }: { result: SearchResult }) {
  return <Paper component={Link} href={result.url} variant="outlined" sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 2, p: 1.5, color: "inherit", textDecoration: "none", "&:hover": { bgcolor: "action.hover" } }}>
    <Box sx={{ minWidth: 0 }}>
      <Typography variant="body2" sx={{ fontWeight: 600 }} noWrap>{result.title}</Typography>
      {result.subtitle && <Typography variant="caption" color="text.secondary" noWrap sx={{ display: "block" }}>{result.subtitle}</Typography>}
    </Box>
    <Stack spacing={0.5} sx={{ alignItems: "flex-end", flexShrink: 0 }}>
      <Chip size="small" color={matchTypeColor[result.matchType]} label={matchTypeLabel[result.matchType]} />
      <Typography variant="caption" color="text.secondary">{Math.round(result.score * 100)}%</Typography>
    </Stack>
  </Paper>;
}
