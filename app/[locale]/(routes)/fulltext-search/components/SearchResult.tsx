"use client";

import { useSearchParams, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Alert, Skeleton, Stack, Typography } from "@mui/material";
import { EntityResultSection } from "@/components/fulltext-search/entity-result-section";
import {
  unifiedSearch,
  type UnifiedSearchResults,
} from "@/actions/fulltext/unified-search";

const ENTITY_LABELS: Record<keyof UnifiedSearchResults, string> = {
  accounts: "Accounts",
  contacts: "Contacts",
  leads: "Leads",
  opportunities: "Opportunities",
  projects: "Projects",
  tasks: "Tasks",
  users: "Users",
  documents: "Documents",
};

const ENTITY_ORDER: (keyof UnifiedSearchResults)[] = [
  "accounts",
  "contacts",
  "leads",
  "opportunities",
  "projects",
  "tasks",
  "users",
  "documents",
];

export default function SearchResult() {
  const searchParams = useSearchParams();
  const params = useParams();
  const query = searchParams?.get("q") ?? "";
  const locale = (params?.locale as string) ?? "en";
  const trimmedQuery = query.trim();
  const requestKey = `${locale}:${trimmedQuery}`;

  const [searchState, setSearchState] = useState<{ key: string; results: UnifiedSearchResults | null } | null>(null);

  useEffect(() => {
    if (trimmedQuery.length < 2) return;
    let active = true;
    unifiedSearch(trimmedQuery, locale)
      .then((res) => {
        if (!active) return;
        if ("error" in res) {
          console.error("[UNIFIED_SEARCH]", res.error);
          setSearchState({ key: requestKey, results: null });
          return;
        }
        setSearchState({ key: requestKey, results: res });
      })
      .catch((err) => {
        if (!active) return;
        console.error(err);
        setSearchState({ key: requestKey, results: null });
      });
    return () => { active = false; };
  }, [trimmedQuery, locale, requestKey]);

  if (!query)
    return <Typography color="text.secondary">Enter a search term above.</Typography>;

  if (trimmedQuery.length < 2)
    return (
      <Typography color="text.secondary" variant="body2">
        Type at least 2 characters to search.
      </Typography>
    );

  if (searchState?.key !== requestKey)
    return (
      <Stack spacing={2}>
        {ENTITY_ORDER.map((key) => (
          <Skeleton key={key} variant="rounded" height={64} />
        ))}
      </Stack>
    );

  const results = searchState.results;
  if (!results) return null;

  const hasAnyResults = ENTITY_ORDER.some((key) => results[key].length > 0);

  if (!hasAnyResults)
    return (
      <Alert severity="info">
        No results found for &quot;{query}&quot;.
      </Alert>
    );

  return (
    <Stack spacing={3}>
      {ENTITY_ORDER.map((key) => (
        <EntityResultSection
          key={key}
          label={ENTITY_LABELS[key]}
          results={results[key]}
        />
      ))}
    </Stack>
  );
}
