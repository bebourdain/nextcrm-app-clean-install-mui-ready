import { Paper, Typography } from "@mui/material";
import { getEmailAccounts } from "@/actions/emails/accounts";
import { EmailAccountsList } from "../EmailAccountsList";

export async function EmailAccountsTabContent() {
  const accounts = await getEmailAccounts();
  return <Paper variant="outlined" sx={{ p: 3 }}>
    <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>Email Accounts</Typography>
    <EmailAccountsList accounts={accounts} />
  </Paper>;
}
