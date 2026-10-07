"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Stack, TextField } from "@mui/material";
import { Send } from "lucide-react";
import { sendInvoiceEmail } from "@/actions/invoices/send-invoice-email";

interface SendEmailDialogProps {
  invoiceId: string;
  defaultEmail?: string;
}

export function SendEmailDialog({
  invoiceId,
  defaultEmail,
}: SendEmailDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [sending, setSending] = useState(false);
  const [to, setTo] = useState(defaultEmail ?? "");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");

  const handleSend = async () => {
    if (!to) {
      toast.error("Email address is required");
      return;
    }
    setSending(true);
    try {
      await sendInvoiceEmail({
        invoiceId,
        to,
        subject: subject || undefined,
        message: message || undefined,
      });
      toast.success("Invoice sent by email");
      setOpen(false);
      router.refresh();
    } catch {
      toast.error("Failed to send email");
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      <Button variant="outlined" size="small" startIcon={<Send size={16} />} onClick={() => setOpen(true)}>Send by Email</Button>
      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Send Invoice by Email</DialogTitle>
        <DialogContent><Stack spacing={2} sx={{ pt: 1 }}>
          <TextField type="email" label="To" value={to} onChange={(event) => setTo(event.target.value)} placeholder="recipient@example.com" disabled={sending} fullWidth />
          <TextField label="Subject (optional)" value={subject} onChange={(event) => setSubject(event.target.value)} placeholder="Custom subject line" disabled={sending} fullWidth />
          <TextField label="Message (optional)" value={message} onChange={(event) => setMessage(event.target.value)} placeholder="Optional message to include" multiline minRows={3} disabled={sending} fullWidth />
        </Stack></DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}><Button onClick={() => setOpen(false)} disabled={sending}>Cancel</Button><Button variant="contained" onClick={handleSend} disabled={sending || !to}>{sending ? "Sending..." : "Send"}</Button></DialogActions>
      </Dialog>
    </>
  );
}
