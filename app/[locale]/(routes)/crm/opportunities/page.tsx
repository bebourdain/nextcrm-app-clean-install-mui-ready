import { getAllCrmData } from "@/actions/crm/get-crm-data";
import { getOpportunitiesFull } from "@/actions/crm/get-opportunities-with-includes";
import { MuiOpportunitiesPage } from "./components/MuiOpportunitiesPage";

const OpportunitiesPage = async () => {
  const crmData = await getAllCrmData();
  const opportunities = await getOpportunitiesFull();

  return <MuiOpportunitiesPage crmData={crmData} data={opportunities} />;
};

export default OpportunitiesPage;
