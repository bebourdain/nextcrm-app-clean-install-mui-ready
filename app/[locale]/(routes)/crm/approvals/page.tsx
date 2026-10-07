import { redirect } from "next/navigation";
import { Box, Divider } from "@mui/material";
import { MuiPageHeader } from "@/components/mui/MuiPageHeader";
import {
  requireRole,
  AuthenticationError,
  AuthorizationError,
} from "@/lib/authz";
import { getPendingApprovals } from "@/actions/crm/opportunities/get-pending-approvals";
import ApprovalsTable from "./components/ApprovalsTable";

const ApprovalsPage = async () => {
  try {
    await requireRole(["manager", "admin"]);
  } catch (e) {
    if (e instanceof AuthenticationError) redirect("/sign-in");
    if (e instanceof AuthorizationError) redirect("/");
    throw e;
  }
  const pending = await getPendingApprovals();
  const rows = Array.isArray(pending) ? pending : [];
  return (
    <Box sx={{ width: "100%", pb: 6 }}>
      <MuiPageHeader title="Quote approvals" description="Deals waiting for a quote/SOW decision" />
      <Divider sx={{ my: 2 }} />
      <ApprovalsTable rows={rows} />
    </Box>
  );
};

export default ApprovalsPage;
