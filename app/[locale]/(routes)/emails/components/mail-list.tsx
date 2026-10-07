"use client";

import { formatDistanceToNow } from "date-fns";
import { useRouter, useSearchParams } from "next/navigation";
import { Box, Button, Divider, List, ListItemButton, Stack, Typography } from "@mui/material";
import type { Mail } from "@/app/[locale]/(routes)/emails/data";
import { useMail } from "@/app/[locale]/(routes)/emails/use-mail";

export function MailList({ items, page, totalPages }: { items: Mail[]; page: number; totalPages: number }) {
  const [mail, setMail] = useMail();
  const router = useRouter();
  const searchParams = useSearchParams();
  const navigate = (toPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(toPage));
    router.push(`?${params.toString()}`);
  };
  return <Box sx={{ height: "100%", display: "flex", flexDirection: "column", minHeight: 0 }}>
    <List sx={{ flex: 1, overflowY: "auto", px: 1.5, py: 1 }}>
      {items.map((item) => <ListItemButton key={item.id} selected={mail.selected === item.id} onClick={() => setMail({ ...mail, selected: item.id })} sx={{ mb: 1, p: 1.5, border: 1, borderColor: "divider", borderRadius: 1, alignItems: "stretch", flexDirection: "column", "&:hover": { bgcolor: "action.hover" } }}>
        <Stack direction="row" spacing={1} sx={{ width: "100%", alignItems: "center", minWidth: 0 }}>
          <Typography variant="body2" noWrap sx={{ fontWeight: 600, flex: 1 }}>{item.fromName ?? item.fromEmail ?? "Unknown"}</Typography>
          {!item.isRead && <Box aria-label="Unread" sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: "primary.main", flexShrink: 0 }} />}
          <Typography variant="caption" color="text.secondary" sx={{ whiteSpace: "nowrap" }}>{item.sentAt ? formatDistanceToNow(new Date(item.sentAt), { addSuffix: true }) : ""}</Typography>
        </Stack>
        <Typography variant="caption" noWrap sx={{ width: "100%", mt: 0.5 }}>{item.subject ?? "(no subject)"}</Typography>
      </ListItemButton>)}
    </List>
    {totalPages > 1 && <><Divider /><Stack direction="row" sx={{ px: 1.5, py: 1, justifyContent: "space-between", alignItems: "center" }}><Button size="small" disabled={page <= 1} onClick={() => navigate(page - 1)}>Previous</Button><Typography variant="caption" color="text.secondary">{page} / {totalPages}</Typography><Button size="small" disabled={page >= totalPages} onClick={() => navigate(page + 1)}>Next</Button></Stack></>}
  </Box>;
}
