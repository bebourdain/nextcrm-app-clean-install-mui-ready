"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button, CircularProgress } from "@mui/material";
import { FileCheck2 } from "lucide-react";
import { requestApproval } from "@/actions/crm/opportunities/approval";

const RequestApprovalButton = ({ opportunityId }: { opportunityId: string }) => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    setLoading(true);
    try {
      const res = await requestApproval(opportunityId);
      if (res.error) toast.error(res.error);
      else {
        toast.success("Approval requested — approvers were notified.");
        router.refresh();
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      variant="outlined"
      size="small"
      onClick={submit}
      disabled={loading}
      startIcon={loading ? <CircularProgress size={16} color="inherit" /> : <FileCheck2 size={16} />}
    >
      Request approval
    </Button>
  );
};

export default RequestApprovalButton;
