"use client";

import { useEffect, useState, type MouseEventHandler, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { addDays, addHours, format, nextSaturday } from "date-fns";
import { Archive, ArchiveX, Clock, Forward, MoreVertical, Reply, ReplyAll, Trash2 } from "lucide-react";
import { Avatar, Box, Button, Divider, FormControlLabel, IconButton, Menu, MenuItem, Popover, Stack, Switch, TextField, Tooltip, Typography } from "@mui/material";
import type { Mail } from "@/app/[locale]/(routes)/emails/data";
import { getEmail, deleteEmail } from "@/actions/emails/messages";
import { ComposeModal } from "@/app/[locale]/(routes)/emails/components/ComposeModal";

export function MailDisplay({ mail, activeAccountId }: { mail: Mail | null; activeAccountId: string | null }) {
  const today = new Date();
  const router = useRouter();
  const [fetchedEmail, setFetchedEmail] = useState<Awaited<ReturnType<typeof getEmail>> | null>(null);
  const [snoozeAnchor, setSnoozeAnchor] = useState<HTMLElement | null>(null);
  const [moreAnchor, setMoreAnchor] = useState<HTMLElement | null>(null);

  useEffect(() => {
    if (!mail?.id) return;
    let cancelled = false;
    getEmail(mail.id).then((data) => { if (!cancelled) setFetchedEmail(data); }).catch(() => { if (!cancelled) setFetchedEmail(null); });
    return () => { cancelled = true; };
  }, [mail?.id]);

  const fullEmail = mail && fetchedEmail?.id === mail.id ? fetchedEmail : null;
  const senderName = fullEmail?.fromName ?? fullEmail?.fromEmail ?? "?";
  const senderInitials = senderName.split(" ").map((part) => part[0]).join("").toUpperCase();
  async function handleDelete() {
    if (!mail?.id) return;
    try { await deleteEmail(mail.id); router.refresh(); }
    catch (error) { console.error("Failed to delete email", error); }
  }
  const action = (label: string, icon: ReactNode, onClick?: MouseEventHandler<HTMLButtonElement>) => <Tooltip title={label}><span><IconButton size="small" aria-label={label} disabled={!mail} onClick={onClick}>{icon}</IconButton></span></Tooltip>;

  return <Box sx={{ display: "flex", flexDirection: "column", height: "100%", minHeight: 0 }}>
    <Stack direction="row" spacing={0.25} sx={{ p: 1, alignItems: "center" }}>
      {action("Archive", <Archive size={16} />)}
      {action("Move to junk", <ArchiveX size={16} />)}
      {action("Move to trash", <Trash2 size={16} />, () => { void handleDelete(); })}
      <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />
      {action("Snooze", <Clock size={16} />, (event) => setSnoozeAnchor(event.currentTarget))}
      <Box sx={{ flex: 1 }} />
      <Tooltip title="Reply"><span><ComposeModal accountId={activeAccountId ?? ""} mode="reply" replyTo={fullEmail ? fullEmail as unknown as Mail : undefined} trigger={<IconButton size="small" aria-label="Reply" disabled={!mail}><Reply size={16} /></IconButton>} /></span></Tooltip>
      {action("Reply all", <ReplyAll size={16} />)}
      <Tooltip title="Forward"><span><ComposeModal accountId={activeAccountId ?? ""} mode="forward" replyTo={fullEmail ? fullEmail as unknown as Mail : undefined} trigger={<IconButton size="small" aria-label="Forward" disabled={!mail}><Forward size={16} /></IconButton>} /></span></Tooltip>
      <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />
      {action("More", <MoreVertical size={16} />, (event) => setMoreAnchor(event.currentTarget))}
    </Stack>
    <Divider />
    <Popover open={Boolean(snoozeAnchor)} anchorEl={snoozeAnchor} onClose={() => setSnoozeAnchor(null)} anchorOrigin={{ vertical: "bottom", horizontal: "left" }}>
      <Box sx={{ p: 2, width: 300 }}><Typography variant="subtitle2" sx={{ mb: 1 }}>Snooze until</Typography><Stack spacing={0.5}>
        {[{ label: "Later today", date: addHours(today, 4) }, { label: "Tomorrow", date: addDays(today, 1) }, { label: "This weekend", date: nextSaturday(today) }, { label: "Next week", date: addDays(today, 7) }].map((option) => <Button key={option.label} variant="text" color="inherit" sx={{ justifyContent: "space-between", textTransform: "none" }}>{option.label}<Typography variant="caption" color="text.secondary">{format(option.date, "E, h:m b")}</Typography></Button>)}
        <TextField size="small" type="date" label="Choose date" slotProps={{ inputLabel: { shrink: true } }} />
      </Stack></Box>
    </Popover>
    <Menu anchorEl={moreAnchor} open={Boolean(moreAnchor)} onClose={() => setMoreAnchor(null)}>
      {["Mark as unread", "Star thread", "Add label", "Mute thread"].map((label) => <MenuItem key={label} onClick={() => setMoreAnchor(null)}>{label}</MenuItem>)}
    </Menu>
    {mail ? <Box sx={{ display: "flex", flexDirection: "column", flex: 1, minHeight: 0 }}>
      <Stack direction="row" spacing={2} sx={{ p: 2, alignItems: "flex-start" }}>
        <Avatar sx={{ width: 40, height: 40 }}>{senderInitials}</Avatar>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography variant="body2" sx={{ fontWeight: 600 }}>{fullEmail?.fromName ?? fullEmail?.fromEmail ?? "(unknown)"}</Typography>
          <Typography variant="caption" sx={{ display: "block" }}>{fullEmail?.subject ?? "(no subject)"}</Typography>
          <Typography variant="caption" sx={{ display: "block" }}><strong>From:</strong> {fullEmail?.fromEmail ?? ""}</Typography>
          {Array.isArray(fullEmail?.toRecipients) && fullEmail.toRecipients.length > 0 && <Typography variant="caption" sx={{ display: "block" }}><strong>To:</strong> {(fullEmail.toRecipients as { name?: string; email: string }[]).map((recipient) => recipient.name ?? recipient.email).join(", ")}</Typography>}
          {Array.isArray(fullEmail?.ccRecipients) && fullEmail.ccRecipients.length > 0 && <Typography variant="caption" sx={{ display: "block" }}><strong>CC:</strong> {(fullEmail.ccRecipients as { name?: string; email: string }[]).map((recipient) => recipient.name ?? recipient.email).join(", ")}</Typography>}
        </Box>
        {fullEmail?.sentAt && <Typography variant="caption" color="text.secondary" sx={{ whiteSpace: "nowrap" }}>{format(new Date(fullEmail.sentAt), "PPpp")}</Typography>}
      </Stack>
      <Divider />
      <Box sx={{ flex: 1, minHeight: 120, overflow: "auto" }}>
        {fullEmail?.bodyHtml ? <iframe srcDoc={fullEmail.bodyHtml} sandbox="allow-popups allow-popups-to-escape-sandbox" referrerPolicy="no-referrer" style={{ width: "100%", height: 600, maxHeight: 600, border: 0 }} title="Email body" /> :
          <Typography component="pre" variant="body2" sx={{ whiteSpace: "pre-wrap", fontFamily: "inherit", p: 2 }}>{fullEmail?.bodyText ?? (fullEmail ? "(No content)" : "Loading...")}</Typography>}
      </Box>
      <Divider />
      <Box component="form" sx={{ p: 2, display: "grid", gap: 1.5 }}>
        <TextField multiline minRows={3} placeholder={`Reply to ${fullEmail?.fromName ?? fullEmail?.fromEmail ?? "..."}...`} fullWidth />
        <Stack direction="row" sx={{ alignItems: "center", justifyContent: "space-between" }}><FormControlLabel control={<Switch size="small" />} label="Mute this thread" /><Button type="submit" variant="contained" size="small">Send</Button></Stack>
      </Box>
    </Box> : <Typography variant="body2" color="text.secondary" sx={{ p: 4, textAlign: "center" }}>No message selected</Typography>}
  </Box>;
}
