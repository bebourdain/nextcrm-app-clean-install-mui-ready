import { Box, Divider } from "@mui/material";
import { MuiPageHeader } from "@/components/mui/MuiPageHeader";
import { getSaleStages } from "@/actions/crm/get-sales-stage";
import CRMKanban from "./_components/CRMKanban";
import { getOpportunities } from "@/actions/crm/get-opportunities";
import { getAllCrmData } from "@/actions/crm/get-crm-data";
import { serializeDecimalsList } from "@/lib/serialize-decimals";

const CrmDashboardPage = async () => {
  const salesStages = await getSaleStages();
  const opportunities = serializeDecimalsList(await getOpportunities());
  const crmData = await getAllCrmData();

  return (
    <Box sx={{ width: "100%", pb: 6 }}>
      <MuiPageHeader title="CRM Dashboard" description="Drag opportunities between stages or reorder them within a stage. Changes are saved automatically." />
      <Divider sx={{ my: 2 }} />
      <Box sx={{ width: "100%", overflow: "hidden" }}>
        <CRMKanban
          salesStages={salesStages}
          opportunities={opportunities}
          crmData={crmData}
        />
      </Box>
    </Box>
  );
};

export default CrmDashboardPage;
