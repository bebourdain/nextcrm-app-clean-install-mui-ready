import { getActivitiesByEntity } from "@/actions/crm/activities/get-activities-by-entity";
import { MuiContractActivities } from "./MuiContractActivities";

interface Props {
  contractId: string;
}

export async function ActivitiesSection({ contractId }: Props) {
  const initialData = await getActivitiesByEntity("contract", contractId);
  return (
    <MuiContractActivities contractId={contractId} initialData={initialData} />
  );
}
