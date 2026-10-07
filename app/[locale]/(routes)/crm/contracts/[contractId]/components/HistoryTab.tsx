import { getAuditLogByEntity } from "@/actions/crm/audit-log/get-audit-log-by-entity";
import { getSession } from "@/lib/auth-server";
import { MuiContractHistory } from "./MuiContractHistory";

export async function HistoryTab({ contractId }: { contractId: string }) {
  const [initialData, session] = await Promise.all([
    getAuditLogByEntity("contract", contractId),
    getSession(),
  ]);

  return (
    <MuiContractHistory
      contractId={contractId}
      initialData={initialData}
      role={session?.user?.role ?? "user"}
    />
  );
}
