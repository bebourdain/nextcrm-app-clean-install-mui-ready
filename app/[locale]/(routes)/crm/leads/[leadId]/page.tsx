import { getLead } from "@/actions/crm/get-lead";
import { BasicView } from "./components/BasicView";
import { MuiLeadDetailLayout } from "./components/MuiLeadDetailLayout";
import { MuiFindSimilarButton } from "./components/MuiFindSimilarButton";
import { HistoryTab } from "./components/HistoryTab";
import { ActivitiesSection } from "./components/ActivitiesSection";

interface Props { params: Promise<{ leadId: string }> }

export default async function LeadDetailPage({ params }: Props) {
  const { leadId } = await params;
  const lead = await getLead(leadId);
  if (!lead) return <div>Lead not found</div>;
  return <MuiLeadDetailLayout
    title={`Lead: ${lead.firstName ?? ""} ${lead.lastName}`}
    description="Everything you need to know about sales potential"
    overview={<>
      <BasicView data={lead} />
      <ActivitiesSection leadId={lead.id} />
      <MuiFindSimilarButton recordId={leadId} />
    </>}
    history={<HistoryTab leadId={leadId} />}
  />;
}
