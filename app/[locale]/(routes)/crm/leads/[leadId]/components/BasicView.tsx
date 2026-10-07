import Link from "next/link";
import moment from "moment";
import { Box, Divider, Paper, Stack, Typography } from "@mui/material";
import { prismadb } from "@/lib/prisma";
import { getAllCrmData } from "@/actions/crm/get-crm-data";
import { LeadDetailActions } from "./LeadDetailActions";

export async function BasicView({ data }: { data: any }) {
  const [users, crmData] = await Promise.all([prismadb.users.findMany({ select: { id: true, name: true } }), getAllCrmData()]);
  const userName = (id?: string | null) => users.find((user) => user.id === id)?.name ?? "—";
  const value = (item?: string | null) => item || "—";
  const field = (label: string, content: React.ReactNode) => <Box sx={{ py: 1.5 }}><Typography variant="body2" sx={{ fontWeight: 600 }}>{label}</Typography><Typography variant="body2" color="text.secondary" component="div" sx={{ mt: 0.5, overflowWrap: "anywhere" }}>{content}</Typography></Box>;
  return <Paper variant="outlined" sx={{ borderRadius: "var(--radius)" }}>
    <Stack direction="row" sx={{ p: 3, alignItems: "flex-start", justifyContent: "space-between" }}>
      <Box><Typography variant="h5" component="h2">{data.firstName} {data.lastName}</Typography><Typography variant="body2" color="text.secondary">ID: {data.id}</Typography></Box>
      <LeadDetailActions lead={data} leadSources={crmData.leadSources} leadStatuses={crmData.leadStatuses} leadTypes={crmData.leadTypes} />
    </Stack>
    <Divider />
    <Box sx={{ p: 3, display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, columnGap: 4 }}>
      <Box>
        {field("Name", [data.firstName, data.lastName].filter(Boolean).join(" "))}
        {field("Company name", value(data.company))}
        {field("Job title", value(data.jobTitle))}
        {field("Description", value(data.description))}
        {field("Email", data.email ? <Link href={`mailto:${data.email}`}>{data.email}</Link> : "—")}
        {field("Website", data.website ? <Link href={data.website}>{data.website}</Link> : "—")}
        {field("Phone", value(data.phone))}
      </Box>
      <Box>
        {field("Assigned to", userName(data.assigned_to))}
        {field("Created", data.createdAt ? moment(data.createdAt).format("MMM DD YYYY") : "—")}
        {field("Created by", userName(data.createdBy))}
        {field("Last update", data.updatedAt ? moment(data.updatedAt).format("MMM DD YYYY") : "—")}
        {field("Last update by", userName(data.updatedBy))}
        {field("Status", data.lead_status?.name ?? "—")}
        {field("Type", data.lead_type?.name ?? "—")}
        {field("Lead source", data.lead_source?.name ?? "—")}
        {field("Referred by", value(data.refered_by))}
      </Box>
    </Box>
  </Paper>;
}
