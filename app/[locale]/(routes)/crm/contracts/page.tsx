import { Box, Divider } from "@mui/material";
import { MuiPageHeader } from "@/components/mui/MuiPageHeader";
import { getAllCrmData } from "@/actions/crm/get-crm-data";
import { getContractsWithIncludes } from "@/actions/crm/get-contracts";
import ContractsView from "../components/ContractsView";
import { getTranslations } from "next-intl/server";
import { serializeDecimalsList } from "@/lib/serialize-decimals";

const ContractsPage = async () => {
  const t = await getTranslations("CrmPage");
  const crmData = await getAllCrmData();
  const contracts = serializeDecimalsList(await getContractsWithIncludes());
  return (
    <Box sx={{ width: "100%", pb: 6 }}>
      <MuiPageHeader title={t("contracts.pageTitle")} description={t("contracts.pageDescription")} />
      <Divider sx={{ my: 2 }} />
      <ContractsView crmData={crmData} data={contracts} />
    </Box>
  );
};

export default ContractsPage;
