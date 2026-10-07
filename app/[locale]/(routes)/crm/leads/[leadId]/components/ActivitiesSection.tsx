import { getActivitiesByEntity } from "@/actions/crm/activities/get-activities-by-entity";
import { MuiLeadActivities } from "./MuiLeadActivities";

interface Props {
  leadId: string;
}

export async function ActivitiesSection({ leadId }: Props) {
  const initialData = await getActivitiesByEntity("lead", leadId);
  return (
    <MuiLeadActivities leadId={leadId} initialData={initialData} />
  );
}
