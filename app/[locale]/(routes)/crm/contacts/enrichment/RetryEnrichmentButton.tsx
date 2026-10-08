"use client";

import { useState } from "react";
import { Button, CircularProgress } from "@mui/material";
import { RotateCcw } from "lucide-react";
import { toast } from "sonner";

interface RetryEnrichmentButtonProps {
  contactId: string;
  fields: string[];
}

export function RetryEnrichmentButton({ contactId, fields }: RetryEnrichmentButtonProps) {
  const [loading, setLoading] = useState(false);

  const handleRetry = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/crm/contacts/enrich-bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contactIds: [contactId], fields: fields.map((name) => ({ name, displayName: name, description: `Find ${name}`, type: "string", required: false })) }),
      });
      if (res.ok) {
        toast.success("Retry queued. Refresh to see updated status.");
      } else {
        const err = await res.json();
        toast.error(err.error ?? "Failed to retry");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button variant="text" size="small" onClick={handleRetry} disabled={loading} startIcon={loading ? <CircularProgress size={14} /> : <RotateCcw size={14} />}>
      Retry
    </Button>
  );
}
