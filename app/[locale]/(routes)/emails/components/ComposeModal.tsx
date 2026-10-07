"use client";

import { cloneElement, useState, type MouseEventHandler, type ReactElement } from "react";
import { Alert, Button, Dialog, DialogActions, DialogContent, DialogTitle, Stack, TextField } from "@mui/material";
import { sendEmail } from "@/actions/emails/messages";
import { useRouter } from "next/navigation";
import type { Mail } from "@/app/[locale]/(routes)/emails/data";

type Mode = "new" | "reply" | "forward";
type Trigger = ReactElement<{ onClick?: MouseEventHandler<HTMLElement> }>;
type Props = { accountId: string; mode?: Mode; replyTo?: Mail; trigger?: Trigger };

export function ComposeModal({ accountId, mode = "new", replyTo, trigger }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const defaultTo = mode === "reply" ? replyTo?.fromEmail ?? "" : "";
  const defaultSubject = mode === "reply" ? `Re: ${replyTo?.subject ?? ""}` : mode === "forward" ? `Fwd: ${replyTo?.subject ?? ""}` : "";
  const defaultBody = mode === "reply" || mode === "forward" ? `\n\n--- Original ---\n${replyTo?.bodyText ?? ""}` : "";
  const [to, setTo] = useState(defaultTo);
  const [cc, setCc] = useState("");
  const [subject, setSubject] = useState(defaultSubject);
  const [body, setBody] = useState(defaultBody);

  async function handleSend() {
    setSending(true);
    setError(null);
    try {
      await sendEmail({
        accountId,
        to: to.split(",").map((email) => email.trim()).filter(Boolean),
        cc: cc.split(",").map((email) => email.trim()).filter(Boolean),
        subject,
        body,
        inReplyTo: mode === "reply" ? replyTo?.rfcMessageId : undefined,
        references: mode === "reply" ? replyTo?.rfcMessageId : undefined,
      });
      setOpen(false);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Send failed");
    } finally {
      setSending(false);
    }
  }

  const triggerControl = trigger ? cloneElement(trigger, { onClick: (event) => { trigger.props.onClick?.(event); if (!event.defaultPrevented) setOpen(true); } }) : <Button size="small" variant="contained" onClick={() => setOpen(true)}>Compose</Button>;
  return <>
    {triggerControl}
    <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm">
      <DialogTitle>{mode === "reply" ? "Reply" : mode === "forward" ? "Forward" : "New Email"}</DialogTitle>
      <DialogContent><Stack spacing={2} sx={{ pt: 1 }}>
        <TextField label="To" value={to} onChange={(event) => setTo(event.target.value)} placeholder="recipient@example.com" disabled={sending} fullWidth />
        <TextField label="CC" value={cc} onChange={(event) => setCc(event.target.value)} placeholder="cc@example.com" disabled={sending} fullWidth />
        <TextField label="Subject" value={subject} onChange={(event) => setSubject(event.target.value)} disabled={sending} fullWidth />
        <TextField label="Message" value={body} onChange={(event) => setBody(event.target.value)} multiline minRows={8} disabled={sending} fullWidth />
        {error && <Alert severity="error" role="alert">{error}</Alert>}
      </Stack></DialogContent>
      <DialogActions sx={{ px: 3, pb: 3 }}><Button onClick={() => setOpen(false)} disabled={sending}>Cancel</Button><Button variant="contained" onClick={handleSend} disabled={sending}>{sending ? "Sending…" : "Send"}</Button></DialogActions>
    </Dialog>
  </>;
}
