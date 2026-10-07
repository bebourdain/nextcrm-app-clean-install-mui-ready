import { getSession } from "@/lib/auth-server";
import { redirect } from "next/navigation";
import { getAuditLogAdmin } from "@/actions/crm/audit-log/get-audit-log-admin";
import { Box, Typography } from "@mui/material";
import { MuiPageHeader } from "@/components/mui/MuiPageHeader";
import { AuditFilters } from "./AuditFilters";
import { AuditLogClient } from "./AuditLogClient";

const AuditLogPage = async (props: {
  searchParams?: Promise<{
    page?: string;
    entityType?: string;
    action?: string;
    dateFrom?: string;
    dateTo?: string;
  }>;
}) => {
  const session = await getSession();
  if (session?.user?.role !== "admin") redirect("/");

  const sp = await props.searchParams;
  const currentPage = Math.max(1, parseInt(sp?.page ?? "1", 10) || 1);
  const filters = {
    page: currentPage,
    entityType: sp?.entityType,
    action: sp?.action,
    dateFrom: sp?.dateFrom ? new Date(sp.dateFrom) : undefined,
    dateTo: sp?.dateTo ? new Date(sp.dateTo) : undefined,
  };

  const result = await getAuditLogAdmin(filters);
  if ("error" in result) return <Typography>Access denied</Typography>;

  return <Box sx={{ p: 3 }}><MuiPageHeader title="Audit Log" description="Complete history of all CRM changes." /><Box sx={{ my: 3 }}><AuditFilters entityType={sp?.entityType} action={sp?.action} dateFrom={sp?.dateFrom} dateTo={sp?.dateTo} /></Box><AuditLogClient entries={result.data} total={result.total} page={result.page} totalPages={result.totalPages} role={session?.user?.role ?? "user"} /></Box>;
};

export default AuditLogPage;
