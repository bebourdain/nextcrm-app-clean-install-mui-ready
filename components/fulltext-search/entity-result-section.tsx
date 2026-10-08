"use client";

import { Accordion, AccordionDetails, AccordionSummary, Chip, Stack, Typography } from "@mui/material";
import { ExpandMore } from "@mui/icons-material";
import { ResultCard } from "./result-card";
import type { SearchResult } from "@/actions/fulltext/unified-search";

export function EntityResultSection({ label, results }: { label: string; results: SearchResult[] }) {
  if (!results.length) return null;
  return <Accordion defaultExpanded variant="outlined" disableGutters>
    <AccordionSummary expandIcon={<ExpandMore />} aria-label={label}>
      <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>{label}</Typography>
      <Chip size="small" label={results.length} sx={{ ml: 1 }} />
    </AccordionSummary>
    <AccordionDetails><Stack spacing={1}>{results.map((result) => <ResultCard key={result.id} result={result} />)}</Stack></AccordionDetails>
  </Accordion>;
}
