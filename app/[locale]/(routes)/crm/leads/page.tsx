import { Box, Divider } from "@mui/material";
import { MuiPageHeader } from "@/components/mui/MuiPageHeader";
import LeadsView from "../components/LeadsView";

import { getAllCrmData } from "@/actions/crm/get-crm-data";
import { getLeads } from "@/actions/crm/get-leads";
import { getTranslations } from "next-intl/server";

const LeadsPage = async () => {
  const t = await getTranslations("CrmPage");
  const crmData = await getAllCrmData();
  const leads = await getLeads();

  return (
    <Box sx={{ width: "100%", pb: 6 }}>
      <MuiPageHeader title={t("leads.pageTitle")} description={t("leads.pageDescription")} />
      <Divider sx={{ my: 2 }} />
      <LeadsView crmData={crmData} data={leads} />
    </Box>
  );
};

export default LeadsPage;
