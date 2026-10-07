import { getAuditLogByEntity } from "@/actions/crm/audit-log/get-audit-log-by-entity";
import { MuiLeadHistory } from "./MuiLeadHistory";

export async function HistoryTab({ leadId }: { leadId: string }) {
  const initialData = await getAuditLogByEntity("lead", leadId);

  return (
    <MuiLeadHistory
      leadId={leadId}
      initialData={initialData}
    />
  );
}
