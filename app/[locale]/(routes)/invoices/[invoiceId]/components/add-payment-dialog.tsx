"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, MenuItem, Stack, TextField } from "@mui/material";
import { addPayment } from "@/actions/invoices/add-payment";

const PAYMENT_METHODS = [
  "Bank Transfer",
  "Cash",
  "Card",
  "Check",
  "PayPal",
  "Other",
];

interface AddPaymentDialogProps {
  invoiceId: string;
  balanceDue: string;
  currency: string;
}

export function AddPaymentDialog({
  invoiceId,
  balanceDue,
  currency,
}: AddPaymentDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [amount, setAmount] = useState(balanceDue);
  const [paidAt, setPaidAt] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [method, setMethod] = useState("Bank Transfer");
  const [reference, setReference] = useState("");
  const [note, setNote] = useState("");

  const handleSubmit = async () => {
    setSaving(true);
    try {
      await addPayment({
        invoiceId,
        amount: parseFloat(amount),
        paidAt: new Date(paidAt).toISOString(),
        method,
        reference: reference || null,
        note: note || null,
      });
      toast.success("Payment recorded");
      setOpen(false);
      router.refresh();
    } catch {
      toast.error("Failed to add payment");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <Button variant="outlined" size="small" onClick={() => setOpen(true)}>Add Payment</Button>
      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Add Payment ({currency} {balanceDue} due)</DialogTitle>
        <DialogContent><Stack spacing={2} sx={{ pt: 1 }}>
          <TextField label="Amount" type="number" value={amount} onChange={(event) => setAmount(event.target.value)} disabled={saving} fullWidth slotProps={{ htmlInput: { step: "0.01" } }} />
          <TextField label="Date" type="date" value={paidAt} onChange={(event) => setPaidAt(event.target.value)} disabled={saving} fullWidth slotProps={{ inputLabel: { shrink: true } }} />
          <TextField label="Method" select value={method} onChange={(event) => setMethod(event.target.value)} disabled={saving} fullWidth>{PAYMENT_METHODS.map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}</TextField>
          <TextField label="Reference" value={reference} onChange={(event) => setReference(event.target.value)} placeholder="Transaction reference" disabled={saving} fullWidth />
          <TextField label="Note" value={note} onChange={(event) => setNote(event.target.value)} placeholder="Optional note" disabled={saving} fullWidth />
        </Stack></DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}><Button onClick={() => setOpen(false)} disabled={saving}>Cancel</Button><Button variant="contained" onClick={handleSubmit} disabled={saving || !amount || parseFloat(amount) <= 0}>{saving ? "Saving..." : "Record Payment"}</Button></DialogActions>
      </Dialog>
    </>
  );
}
