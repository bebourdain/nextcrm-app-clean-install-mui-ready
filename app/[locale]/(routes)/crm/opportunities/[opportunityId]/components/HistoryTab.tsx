import { getAuditLogByEntity } from "@/actions/crm/audit-log/get-audit-log-by-entity";
import { getSession } from "@/lib/auth-server";
import { MuiOpportunityHistory } from "./MuiOpportunityHistory";

export async function HistoryTab({ opportunityId }: { opportunityId: string }) {
  const [initialData, session] = await Promise.all([
    getAuditLogByEntity("opportunity", opportunityId),
    getSession(),
  ]);

  return (
    <MuiOpportunityHistory
      opportunityId={opportunityId}
      initialData={initialData}
      role={session?.user?.role ?? "user"}
    />
  );
}
