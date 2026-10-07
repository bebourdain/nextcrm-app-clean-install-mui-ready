"use client";

import type { getAllCrmData } from "@/actions/crm/get-crm-data";
import { MuiOpportunitiesPage } from "../opportunities/components/MuiOpportunitiesPage";

type CrmData = Awaited<ReturnType<typeof getAllCrmData>>;

export default function OpportunitiesView({ data, crmData, accountId }: { data: any[]; crmData: CrmData; accountId?: string }) {
  return <MuiOpportunitiesPage data={data} crmData={crmData} embedded accountId={accountId} />;
}
