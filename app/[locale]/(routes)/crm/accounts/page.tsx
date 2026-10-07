import { Box, Divider } from "@mui/material";
import { getTranslations } from "next-intl/server";
import { MuiPageHeader } from "@/components/mui/MuiPageHeader";
import AccountsView from "../components/AccountsView";
import { getAllCrmData } from "@/actions/crm/get-crm-data";
import { getAccounts } from "@/actions/crm/get-accounts";

const AccountsPage = async () => {
  const [crmData, accounts, t] = await Promise.all([getAllCrmData(), getAccounts(), getTranslations("CrmPage")]);
  return <Box sx={{ width: "100%", pb: 6 }}>
    <MuiPageHeader title={t("accounts.pageTitle")} description={t("accounts.pageDescription")} />
    <Divider sx={{ my: 2 }} />
    <AccountsView crmData={crmData} data={accounts} />
  </Box>;
};

export default AccountsPage;
