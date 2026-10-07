import AccountsView from "../components/AccountsView";
import { getAllCrmData } from "@/actions/crm/get-crm-data";
import { getAccounts } from "@/actions/crm/get-accounts";

const AccountsPage = async () => {
  const [crmData, accounts] = await Promise.all([getAllCrmData(), getAccounts()]);
  return <AccountsView crmData={crmData} data={accounts} />;
};

export default AccountsPage;
