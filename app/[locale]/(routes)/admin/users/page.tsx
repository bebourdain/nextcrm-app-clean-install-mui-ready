import { getUsers } from "@/actions/get-users";
import { getSession } from "@/lib/auth-server";
import { getTranslations } from "next-intl/server";
import { Box, Divider, Paper, Stack, Typography } from "@mui/material";
import { MuiPageHeader } from "@/components/mui/MuiPageHeader";
import { InviteForm } from "./components/IviteForm";
import SendMailToAll from "./components/send-mail-to-all";
import { AdminUserDataTable } from "./table-components/data-table";

export default async function AdminUsersPage() {
  const t = await getTranslations("AdminPage");
  const session = await getSession();
  if (session?.user?.role !== "admin") {
    return <Box sx={{ p: 3 }}><MuiPageHeader title={t("title")} description={t("accessNotAllowed")} /><Paper sx={{ p: 4, textAlign: "center" }}>{t("accessNotAllowed")}</Paper></Box>;
  }
  const users = await getUsers();
  return <Box sx={{ p: { xs: 2, md: 3 } }}>
    <MuiPageHeader title={t("users.title")} description={t("users.description")} />
    <Stack spacing={3}>
      <Paper variant="outlined" sx={{ p: 3 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>{t("users.inviteHeading")}</Typography>
        <InviteForm />
      </Paper>
      <Paper variant="outlined" sx={{ p: 3 }}><SendMailToAll /></Paper>
      <Divider />
      <AdminUserDataTable data={users} />
    </Stack>
  </Box>;
}
