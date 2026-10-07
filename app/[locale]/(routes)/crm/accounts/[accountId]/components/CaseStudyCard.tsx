"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Box, Button, Chip, Paper, Stack, Typography } from "@mui/material";
import {
  setCaseStudyCandidate,
  setCaseStudyApproved,
} from "@/actions/crm/accounts/case-study";

type Props = {
  accountId: string;
  candidate: boolean;
  approved: boolean;
  canApprove: boolean; // manager/admin — computed server-side by the page
};

const CaseStudyCard = ({ accountId, candidate, approved, canApprove }: Props) => {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  const run = async (fn: () => Promise<{ error?: string }>) => {
    setBusy(true);
    try {
      const res = await fn();
      if (res.error) toast.error(res.error);
      else router.refresh();
    } finally {
      setBusy(false);
    }
  };

  return (
    <Paper variant="outlined" sx={{ p: 3, borderRadius: "var(--radius)" }}>
      <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ alignItems: { sm: "center" }, justifyContent: "space-between" }}>
        <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}><Typography variant="h6" sx={{ fontWeight: 600 }}>
          Case study
        </Typography>
          {approved ? (
            <Chip label="Approved" size="small" color="success" />
          ) : candidate ? (
            <Chip label="Candidate" size="small" />
          ) : null}
        </Stack>
        <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
          {candidate ? (
            <Button
              size="small"
              variant="outlined"
              disabled={busy}
              onClick={() => run(() => setCaseStudyCandidate(accountId, false))}
            >
              Withdraw candidacy
            </Button>
          ) : (
            <Button
              size="small"
              variant="outlined"
              disabled={busy}
              onClick={() => run(() => setCaseStudyCandidate(accountId, true))}
            >
              Flag as candidate
            </Button>
          )}
          {canApprove && candidate && !approved && (
            <Button
              size="small"
              variant="contained"
              disabled={busy}
              onClick={() => run(() => setCaseStudyApproved(accountId, true))}
            >
              Approve case study
            </Button>
          )}
          {canApprove && approved && (
            <Button
              size="small"
              variant="outlined"
              disabled={busy}
              onClick={() => run(() => setCaseStudyApproved(accountId, false))}
            >
              Revoke approval
            </Button>
          )}
        </Box>
      </Stack>
      <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
        Clients with strong measurable results are flagged here; a manager
        approves before marketing may reference them.
      </Typography>
    </Paper>
  );
};

export default CaseStudyCard;
