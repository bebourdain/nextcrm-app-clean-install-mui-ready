"use client";

import { formatDistanceToNow } from "date-fns";
import { Avatar, Box, Button, Chip, Stack, Typography } from "@mui/material";

const ACTION_LABELS: Record<string, string> = { created: "created", updated: "updated", deleted: "deleted", restored: "restored", relation_added: "linked", relation_removed: "unlinked" };
const ACTION_COLORS: Record<string, "default" | "error" | "success" | "info"> = { created: "success", updated: "info", deleted: "error", restored: "success", relation_added: "default", relation_removed: "default" };

interface AuditChange { field: string; old: unknown; new: unknown }
interface EntryProps {
  entry: { id: string; action: string; changes: AuditChange[] | null; createdAt: Date; user: { name: string | null; avatar: string | null } | null };
  showRestore?: boolean;
  onRestore?: () => void;
}

export function AuditEntry({ entry, showRestore, onRestore }: EntryProps) {
  const userName = entry.user?.name ?? "System";
  const initials = userName.split(" ").map((part) => part[0]).join("").toUpperCase().slice(0, 2);
  return <Box sx={{ display: "flex", gap: 1.5, py: 1.5, borderBottom: 1, borderColor: "divider", "&:last-of-type": { borderBottom: 0 } }}>
    <Avatar src={entry.user?.avatar ?? undefined} sx={{ width: 32, height: 32, fontSize: 12, flexShrink: 0 }}>{initials}</Avatar>
    <Box sx={{ minWidth: 0, flex: 1 }}>
      <Stack direction="row" spacing={1} sx={{ alignItems: "center", flexWrap: "wrap", gap: 0.5 }}>
        <Typography variant="body2" sx={{ fontWeight: 600 }}>{userName}</Typography>
        <Chip size="small" variant="outlined" color={ACTION_COLORS[entry.action] ?? "default"} label={ACTION_LABELS[entry.action] ?? entry.action} />
        <Typography variant="caption" color="text.secondary" sx={{ ml: "auto" }}>{formatDistanceToNow(new Date(entry.createdAt), { addSuffix: true })}</Typography>
      </Stack>
      {entry.changes && entry.changes.length > 0 && <Stack spacing={0.5} sx={{ mt: 1 }}>
        {entry.changes.map((change, index) => <Typography key={index} variant="caption" color="text.secondary"><Box component="span" sx={{ color: "text.primary", fontWeight: 600 }}>{change.field}:</Box>{" "}<Box component="span" sx={{ textDecoration: "line-through", opacity: 0.65 }}>{String(change.old ?? "—")}</Box>{" → "}{String(change.new ?? "—")}</Typography>)}
      </Stack>}
      {showRestore && entry.action === "deleted" && onRestore && <Button size="small" variant="outlined" sx={{ mt: 1 }} onClick={onRestore}>Restore</Button>}
    </Box>
  </Box>;
}
