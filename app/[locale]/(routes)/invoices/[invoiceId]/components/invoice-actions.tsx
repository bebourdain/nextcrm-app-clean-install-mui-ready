"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Link from "next/link";
import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Stack } from "@mui/material";
import { SendEmailDialog } from "./send-email-dialog";
import { AddPaymentDialog } from "./add-payment-dialog";
import {
  Pencil,
  Copy,
  FileDown,
  Ban,
  CheckCircle,
  RefreshCw,
} from "lucide-react";
import { issueInvoice } from "@/actions/invoices/issue-invoice";
import { cancelInvoice } from "@/actions/invoices/cancel-invoice";
import { duplicateInvoice } from "@/actions/invoices/duplicate-invoice";
import { regenerateInvoicePdf } from "@/actions/invoices/regenerate-pdf";

interface InvoiceActionsProps {
  invoiceId: string;
  status: string;
  balanceDue: string;
  currency: string;
  accountEmail?: string;
}

export function InvoiceActions({
  invoiceId,
  status,
  balanceDue,
  currency,
  accountEmail,
}: InvoiceActionsProps) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);
  const [cancelOpen, setCancelOpen] = useState(false);

  const isDraft = status === "DRAFT";
  const canPay = [
    "ISSUED",
    "SENT",
    "PARTIALLY_PAID",
    "OVERDUE",
  ].includes(status);
  const canSend = ["ISSUED", "SENT"].includes(status);

  const handleAction = async (action: "issue" | "cancel" | "duplicate") => {
    setLoading(action);
    try {
      if (action === "issue") {
        await issueInvoice({ invoiceId });
        toast.success("Invoice issued");
        router.refresh();
      } else if (action === "cancel") {
        await cancelInvoice(invoiceId);
        toast.success("Invoice cancelled");
        router.refresh();
      } else {
        const result = await duplicateInvoice(invoiceId);
        toast.success("Invoice duplicated");
        router.push(`/invoices/${result.id}`);
      }
    } catch {
      toast.error(`Failed to ${action} invoice`);
    } finally {
      setLoading(null);
    }
  };

  const handleRegenerate = async () => {
    setLoading("regenerate");
    const res = await regenerateInvoicePdf(invoiceId);
    if (res.ok) {
      toast.success("PDF regenerated");
      router.refresh();
    } else {
      toast.error(res.error);
    }
    setLoading(null);
  };

  return (
    <>
    <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap", rowGap: 1 }}>
      {isDraft && (
        <>
          <Button component={Link} href={`/invoices/${invoiceId}/edit`} variant="outlined" size="small" startIcon={<Pencil size={16} />}>Edit</Button>
          <Button
            variant="contained"
            size="small"
            startIcon={<CheckCircle size={16} />}
            onClick={() => handleAction("issue")}
            disabled={loading === "issue"}
          >
            {loading === "issue" ? "Issuing..." : "Issue"}
          </Button>
          <Button
            variant="outlined"
            color="error"
            size="small"
            startIcon={<Ban size={16} />}
            onClick={() => setCancelOpen(true)}
            disabled={loading === "cancel"}
          >
            Cancel
          </Button>
        </>
      )}

      {canSend && (
        <SendEmailDialog
          invoiceId={invoiceId}
          defaultEmail={accountEmail}
        />
      )}

      {canPay && (
        <AddPaymentDialog
          invoiceId={invoiceId}
          balanceDue={balanceDue}
          currency={currency}
        />
      )}

      <Button
        variant="outlined"
        size="small"
        startIcon={<Copy size={16} />}
        onClick={() => handleAction("duplicate")}
        disabled={loading === "duplicate"}
      >
        Duplicate
      </Button>

      <Button
        component="a"
        href={`/api/invoices/${invoiceId}/pdf`}
        target="_blank"
        rel="noopener noreferrer"
        variant="outlined"
        size="small"
        startIcon={<FileDown size={16} />}
      >
        Download PDF
      </Button>

      {!isDraft && (
        <Button
          variant="outlined"
          size="small"
          startIcon={<RefreshCw size={16} />}
          onClick={handleRegenerate}
          disabled={loading === "regenerate"}
          title="Re-render PDF using current company settings"
        >
          {loading === "regenerate" ? "Regenerating..." : "Regenerate PDF"}
        </Button>
      )}
    </Stack>
    <Dialog open={cancelOpen} onClose={() => { if (loading !== "cancel") setCancelOpen(false); }}>
      <DialogTitle>Cancel this draft invoice?</DialogTitle>
      <DialogContent><DialogContentText>This invoice will be cancelled.</DialogContentText></DialogContent>
      <DialogActions><Button onClick={() => setCancelOpen(false)} disabled={loading === "cancel"}>Keep invoice</Button><Button variant="contained" color="error" disabled={loading === "cancel"} onClick={async () => { await handleAction("cancel"); setCancelOpen(false); }}>{loading === "cancel" ? "Cancelling..." : "Cancel invoice"}</Button></DialogActions>
    </Dialog>
    </>
  );
}
