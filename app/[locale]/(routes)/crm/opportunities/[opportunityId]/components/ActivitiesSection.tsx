import { getActivitiesByEntity } from "@/actions/crm/activities/get-activities-by-entity";
import { MuiOpportunityActivities } from "./MuiOpportunityActivities";

interface Props {
  opportunityId: string;
}

export async function ActivitiesSection({ opportunityId }: Props) {
  const initialData = await getActivitiesByEntity("opportunity", opportunityId);
  return (
    <MuiOpportunityActivities opportunityId={opportunityId} initialData={initialData} />
  );
}
