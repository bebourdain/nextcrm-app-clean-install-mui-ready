"use client";

import { useState, useTransition } from "react";
import { formatDistanceToNow } from "date-fns";
import { Avatar, Box, Button, Card, CardContent, Chip, Divider, Stack, Typography } from "@mui/material";
import { getAuditLogByEntity } from "@/actions/crm/audit-log/get-audit-log-by-entity";

type AuditLog = Awaited<ReturnType<typeof getAuditLogByEntity>>;
type AuditEntry = AuditLog["data"][number];

const actionLabels: Record<string, string> = {
  created: "created",
  updated: "updated",
  deleted: "deleted",
  restored: "restored",
  relation_added: "linked",
  relation_removed: "unlinked",
};

function HistoryEntry({ entry }: { entry: AuditEntry }) {
  const userName = entry.user?.name ?? "System";
  const initials = userName.split(" ").map((name: string) => name[0]).join("").toUpperCase().slice(0, 2);
  const changes = Array.isArray(entry.changes) ? entry.changes as { field: string; old: unknown; new: unknown }[] : [];

  return (
    <>
      <Stack direction="row" spacing={1.5} sx={{ py: 1.5, alignItems: "flex-start" }}>
        <Avatar src={entry.user?.avatar ?? undefined} sx={{ width: 32, height: 32, fontSize: 12 }}>{initials}</Avatar>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Stack direction="row" spacing={1} sx={{ alignItems: "center", flexWrap: "wrap" }}>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>{userName}</Typography>
            <Chip size="small" variant="outlined" color={entry.action === "deleted" ? "error" : entry.action === "created" ? "primary" : "default"} label={actionLabels[entry.action] ?? entry.action} />
            <Typography variant="caption" color="text.secondary" sx={{ ml: "auto" }}>{formatDistanceToNow(new Date(entry.createdAt), { addSuffix: true })}</Typography>
          </Stack>
          {changes.map((change, index) => (
            <Typography key={index} variant="caption" color="text.secondary" sx={{ display: "block", mt: 0.5, overflowWrap: "anywhere" }}>
              <Box component="span" sx={{ fontWeight: 600, color: "text.primary" }}>{change.field}:</Box>{" "}
              <Box component="span" sx={{ textDecoration: "line-through", opacity: 0.65 }}>{String(change.old ?? "—")}</Box>
              {" → "}{String(change.new ?? "—")}
            </Typography>
          ))}
        </Box>
      </Stack>
      <Divider />
    </>
  );
}

export function MuiContractHistory({ contractId, initialData }: { contractId: string; initialData: AuditLog; role?: string }) {
  const [entries, setEntries] = useState<AuditEntry[]>(initialData.data);
  const [cursor, setCursor] = useState<string | null>(initialData.nextCursor);
  const [isPending, startTransition] = useTransition();

  const loadMore = () => {
    startTransition(async () => {
      const result = await getAuditLogByEntity("contract", contractId, cursor ?? undefined);
      setEntries((current) => [...current, ...result.data]);
      setCursor(result.nextCursor);
    });
  };

  return (
    <Card>
      <Box sx={{ p: 3, pb: 1.5 }}>
        <Typography variant="h5" component="h2">History</Typography>
        <Divider sx={{ mt: 2.5 }} />
      </Box>
      <CardContent sx={{ pt: 1.5 }}>
        {entries.length === 0
          ? <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>No history yet.</Typography>
          : entries.map((entry) => <HistoryEntry key={entry.id} entry={entry} />)}
        {cursor && <Button variant="text" size="small" onClick={loadMore} disabled={isPending} sx={{ mt: 1, display: "block", mx: "auto" }}>{isPending ? "Loading..." : "Load more"}</Button>}
      </CardContent>
    </Card>
  );
}
