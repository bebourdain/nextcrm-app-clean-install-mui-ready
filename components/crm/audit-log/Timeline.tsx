"use client";

import { useState, useTransition } from "react";
import { Box, Button, Stack, Typography } from "@mui/material";
import { AuditEntry } from "./Entry";
import { getAuditLogByEntity } from "@/actions/crm/audit-log/get-audit-log-by-entity";

type AuditLogEntry = Awaited<ReturnType<typeof getAuditLogByEntity>>["data"][number];
interface TimelineProps {
  entityType: string;
  entityId: string;
  initialData: Awaited<ReturnType<typeof getAuditLogByEntity>>;
  role?: string;
  onRestore?: (entryId: string) => void;
}

export function AuditTimeline({ entityType, entityId, initialData, role, onRestore }: TimelineProps) {
  const [entries, setEntries] = useState<AuditLogEntry[]>(initialData.data);
  const [cursor, setCursor] = useState<string | null>(initialData.nextCursor);
  const [isPending, startTransition] = useTransition();

  const loadMore = () => startTransition(async () => {
    const result = await getAuditLogByEntity(entityType, entityId, cursor ?? undefined);
    setEntries((prev) => [...prev, ...result.data]);
    setCursor(result.nextCursor);
  });

  if (entries.length === 0) return <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>No history yet.</Typography>;

  return <Stack spacing={1}>
    <Box>{entries.map((entry) => <AuditEntry key={entry.id} entry={entry as any} showRestore={role === "admin"} onRestore={onRestore ? () => onRestore(entry.id) : undefined} />)}</Box>
    {cursor && <Button fullWidth size="small" onClick={loadMore} disabled={isPending}>{isPending ? "Loading..." : "Load more"}</Button>}
  </Stack>;
}
