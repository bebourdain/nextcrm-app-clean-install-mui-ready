"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Button, MenuItem, Stack, TextField, Typography } from "@mui/material";

type Props = { entityType?: string; action?: string; dateFrom?: string; dateTo?: string };
export function AuditFilters({ entityType, action, dateFrom, dateTo }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  function apply(overrides: Record<string, string>) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", "1");
    Object.entries(overrides).forEach(([key, value]) => { if (value) params.set(key, value); else params.delete(key); });
    router.push(`${pathname}?${params.toString()}`);
  }
  return <Stack direction="row" spacing={1.5} sx={{ alignItems: "center", flexWrap: "wrap", gap: 1 }}><TextField select size="small" label="Entity type" value={entityType ?? "all"} onChange={(event) => apply({ entityType: event.target.value === "all" ? "" : event.target.value })} sx={{ minWidth: 160 }}>{[["all", "All entities"], ["account", "Account"], ["contact", "Contact"], ["lead", "Lead"], ["opportunity", "Opportunity"], ["contract", "Contract"]].map(([value, label]) => <MenuItem key={value} value={value}>{label}</MenuItem>)}</TextField><TextField select size="small" label="Action" value={action ?? "all"} onChange={(event) => apply({ action: event.target.value === "all" ? "" : event.target.value })} sx={{ minWidth: 160 }}>{[["all", "All actions"], ["created", "Created"], ["updated", "Updated"], ["deleted", "Deleted"], ["restored", "Restored"], ["relation_added", "Relation added"], ["relation_removed", "Relation removed"]].map(([value, label]) => <MenuItem key={value} value={value}>{label}</MenuItem>)}</TextField><TextField size="small" type="date" label="From" value={dateFrom ?? ""} onChange={(event) => apply({ dateFrom: event.target.value })} slotProps={{ inputLabel: { shrink: true } }} sx={{ width: 160 }} /><Typography variant="body2" color="text.secondary">to</Typography><TextField size="small" type="date" label="To" value={dateTo ?? ""} onChange={(event) => apply({ dateTo: event.target.value })} slotProps={{ inputLabel: { shrink: true } }} sx={{ width: 160 }} />{(entityType || action || dateFrom || dateTo) && <Button size="small" onClick={() => router.push(pathname)}>Clear filters</Button>}</Stack>;
}
