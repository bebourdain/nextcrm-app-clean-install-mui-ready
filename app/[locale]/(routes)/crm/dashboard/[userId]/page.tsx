import { getSession } from "@/lib/auth-server";
import { redirect } from "next/navigation";
import { Box, Card, CardContent, Divider, Typography } from "@mui/material";
import { MuiPageHeader } from "@/components/mui/MuiPageHeader";
import { getUserCRMTasks } from "@/actions/crm/tasks/get-user-tasks";

const UserCRMDashboard = async () => {
  const session = await getSession();

  if (!session) {
    redirect("/auth/signin");
  }

  const task = await getUserCRMTasks(session.user.id);

  return (
    <Box sx={{ width: "100%", pb: 6 }}>
      <MuiPageHeader title={`${session.user.name} | CRM Dashboard (in-progress)`} description="Your sales data in one place" />
      <Divider sx={{ my: 2 }} />
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "repeat(2, minmax(0, 1fr))" }, gap: 2 }}>
        <Card variant="outlined"><CardContent><Typography variant="h6">Calls overview</Typography></CardContent></Card>
        <Card variant="outlined"><CardContent><Typography variant="h6" sx={{ mb: 2 }}>Tasks in Accounts</Typography><Typography component="pre" variant="body2" sx={{ whiteSpace: "pre-wrap", overflowWrap: "anywhere" }}>{JSON.stringify(task, null, 2)}</Typography></CardContent></Card>
        <Card variant="outlined"><CardContent><Typography variant="h6">Meetings overview</Typography></CardContent></Card>
        <Card variant="outlined"><CardContent><Typography variant="h6">Leads overview</Typography></CardContent></Card>
      </Box>
    </Box>
  );
};

export default UserCRMDashboard;
