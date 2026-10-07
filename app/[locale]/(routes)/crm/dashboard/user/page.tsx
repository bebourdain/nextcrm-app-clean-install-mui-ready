import { Box, Card, CardContent, Chip, Divider, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from "@mui/material";
import { MuiPageHeader } from "@/components/mui/MuiPageHeader";
import { getSession } from "@/lib/auth-server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getUserCRMTasks } from "@/actions/crm/tasks/get-user-tasks";
import { getUserLeads } from "@/actions/crm/get-user-leads";
import { getUserOpportunities } from "@/actions/crm/get-user-opportunities";

const linkStyle = { color: "inherit", textDecoration: "none" };

export default async function UserDashboardPage() {
  const session = await getSession();
  if (!session) redirect("/auth/signin");
  const [tasks, leads, opportunities] = await Promise.all([
    getUserCRMTasks(session.user.id),
    getUserLeads(session.user.id),
    getUserOpportunities(session.user.id),
  ]);
  const stats = [
    { label: "Total Tasks", value: tasks.length },
    { label: "Open Tasks", value: tasks.filter((task) => task.taskStatus === "ACTIVE").length },
    { label: "My Leads", value: leads.length },
    { label: "Active Opportunities", value: opportunities.filter((opportunity) => opportunity.status === "ACTIVE").length },
  ];
  return <Box sx={{ width: "100%", pb: 6 }}>
    <MuiPageHeader title={`${session.user.name} — My Dashboard`} description="Your personal CRM overview" />
    <Divider sx={{ my: 2 }} />
    <Box sx={{ display: "grid", gridTemplateColumns: { xs: "repeat(2, minmax(0, 1fr))", md: "repeat(4, minmax(0, 1fr))" }, gap: 2, mb: 3 }}>
      {stats.map(({ label, value }) => <Card key={label} variant="outlined"><CardContent><Typography variant="body2" color="text.secondary">{label}</Typography><Typography variant="h5" sx={{ fontWeight: 700, mt: 1 }}>{value}</Typography></CardContent></Card>)}
    </Box>
    <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "repeat(2, minmax(0, 1fr))" }, gap: 3 }}>
      <Card variant="outlined"><CardContent sx={{ pb: 1 }}><Typography variant="h6">My Tasks</Typography></CardContent>
        {tasks.length === 0 ? <Typography variant="body2" color="text.secondary" sx={{ px: 2, pb: 2 }}>No tasks assigned.</Typography> :
        <TableContainer><Table size="small"><TableHead><TableRow><TableCell>Title</TableCell><TableCell>Priority</TableCell><TableCell>Status</TableCell></TableRow></TableHead><TableBody>
          {tasks.slice(0, 8).map((task) => <TableRow key={task.id}><TableCell><Link href={`/crm/tasks/viewtask/${task.id}`} style={linkStyle}>{task.title}</Link></TableCell><TableCell><Chip size="small" label={task.priority} color={task.priority === "high" ? "error" : "default"} variant={task.priority === "high" ? "filled" : "outlined"} /></TableCell><TableCell><Chip size="small" label={task.taskStatus} color={task.taskStatus === "ACTIVE" ? "primary" : "default"} /></TableCell></TableRow>)}
        </TableBody></Table></TableContainer>}
      </Card>
      <Card variant="outlined"><CardContent sx={{ pb: 1 }}><Typography variant="h6">My Opportunities</Typography></CardContent>
        {opportunities.length === 0 ? <Typography variant="body2" color="text.secondary" sx={{ px: 2, pb: 2 }}>No opportunities assigned.</Typography> :
        <TableContainer><Table size="small"><TableHead><TableRow><TableCell>Name</TableCell><TableCell>Stage</TableCell><TableCell>Budget</TableCell></TableRow></TableHead><TableBody>
          {opportunities.slice(0, 8).map((opp) => <TableRow key={opp.id}><TableCell><Link href={`/crm/opportunities/${opp.id}`} style={linkStyle}>{opp.name ?? "—"}</Link></TableCell><TableCell>{opp.assigned_sales_stage?.name ?? "—"}</TableCell><TableCell>{opp.budget ? `$${Number(opp.budget).toLocaleString()}` : "—"}</TableCell></TableRow>)}
        </TableBody></Table></TableContainer>}
      </Card>
      <Card variant="outlined" sx={{ gridColumn: { md: "span 2" } }}><CardContent sx={{ pb: 1 }}><Typography variant="h6">My Leads</Typography></CardContent>
        {leads.length === 0 ? <Typography variant="body2" color="text.secondary" sx={{ px: 2, pb: 2 }}>No leads assigned.</Typography> :
        <TableContainer><Table size="small"><TableHead><TableRow><TableCell>Name</TableCell><TableCell>Company</TableCell><TableCell>Email</TableCell><TableCell>Status</TableCell><TableCell>Source</TableCell></TableRow></TableHead><TableBody>
          {leads.slice(0, 10).map((lead) => <TableRow key={lead.id}><TableCell><Link href={`/crm/leads/${lead.id}`} style={linkStyle}>{[lead.firstName, lead.lastName].filter(Boolean).join(" ")}</Link></TableCell><TableCell>{lead.company ?? "—"}</TableCell><TableCell>{lead.email ?? "—"}</TableCell><TableCell><Chip size="small" label="—" variant="outlined" /></TableCell><TableCell>—</TableCell></TableRow>)}
        </TableBody></Table></TableContainer>}
      </Card>
    </Box>
  </Box>;
}
