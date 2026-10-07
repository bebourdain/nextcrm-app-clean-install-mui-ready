"use client";

import { Fragment, useState, useTransition } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Box, Button, Chip, Paper, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from "@mui/material";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";
import { restoreAccount } from "@/actions/crm/accounts/restore-account";
import { restoreContact } from "@/actions/crm/contacts/restore-contact";
import { restoreLead } from "@/actions/crm/leads/restore-lead";
import { restoreOpportunity } from "@/actions/crm/opportunities/restore-opportunity";
import { restoreContract } from "@/actions/crm/contracts/restore-contract";

type Entry = { id: string; entityType: string; entityId: string; action: string; changes: unknown; createdAt: Date; user: { id: string; name: string | null; avatar: string | null } | null };
type Props = { entries: Entry[]; total: number; page: number; totalPages: number; role?: string };
export function AuditLogClient({ entries, total, page, totalPages, role }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [expanded, setExpanded] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  function goPage(nextPage: number) { const params = new URLSearchParams(searchParams.toString()); params.set("page", String(nextPage)); router.push(`${pathname}?${params.toString()}`); }
  function handleRestore(entityType: string, entityId: string) {
    startTransition(async () => {
      let result: { error?: string; success?: boolean };
      switch (entityType) {
        case "account": result = await restoreAccount(entityId); break;
        case "contact": result = await restoreContact(entityId); break;
        case "lead": result = await restoreLead(entityId); break;
        case "opportunity": result = await restoreOpportunity(entityId); break;
        case "contract": result = await restoreContract(entityId); break;
        default: result = { error: "Unknown entity type" };
      }
      if (result.error) toast.error(result.error);
      else { toast.success("Record restored successfully"); router.refresh(); }
    });
  }
  return <Stack spacing={2}><Typography variant="body2" color="text.secondary">{total} total entries</Typography><TableContainer component={Paper} variant="outlined"><Table size="small"><TableHead><TableRow><TableCell>Entity</TableCell><TableCell>Action</TableCell><TableCell>User</TableCell><TableCell>Date</TableCell>{role === "admin" && <TableCell>Actions</TableCell>}</TableRow></TableHead><TableBody>{entries.map((entry) => <Fragment key={entry.id}><TableRow hover onClick={() => setExpanded(expanded === entry.id ? null : entry.id)} sx={{ cursor: "pointer" }}><TableCell sx={{ textTransform: "capitalize" }}>{entry.entityType}</TableCell><TableCell><Chip size="small" color={entry.action === "deleted" ? "error" : "default"} label={entry.action} /></TableCell><TableCell>{entry.user?.name ?? "System"}</TableCell><TableCell>{formatDistanceToNow(new Date(entry.createdAt), { addSuffix: true })}</TableCell>{role === "admin" && <TableCell>{entry.action === "deleted" && <Button size="small" variant="outlined" disabled={pending} onClick={(event) => { event.stopPropagation(); handleRestore(entry.entityType, entry.entityId); }}>Restore</Button>}</TableCell>}</TableRow>{expanded === entry.id && entry.changes != null && <TableRow><TableCell colSpan={role === "admin" ? 5 : 4} sx={{ bgcolor: "action.hover" }}><Box component="pre" sx={{ m: 0, fontSize: 12, overflowX: "auto" }}>{JSON.stringify(entry.changes, null, 2)}</Box></TableCell></TableRow>}</Fragment>)}{entries.length === 0 && <TableRow><TableCell colSpan={role === "admin" ? 5 : 4} align="center" sx={{ py: 5 }}><Typography color="text.secondary">No audit entries found.</Typography></TableCell></TableRow>}</TableBody></Table></TableContainer><Stack direction="row" spacing={1} sx={{ alignItems: "center" }}><Button size="small" variant="outlined" disabled={page <= 1} onClick={() => goPage(page - 1)}>Previous</Button><Typography variant="body2" color="text.secondary">Page {page} of {totalPages}</Typography><Button size="small" variant="outlined" disabled={page >= totalPages} onClick={() => goPage(page + 1)}>Next</Button></Stack></Stack>;
}
