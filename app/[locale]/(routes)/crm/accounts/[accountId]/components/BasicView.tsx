import type { ReactNode } from "react";
import Link from "next/link";
import moment from "moment";
import { Box, Divider, Paper, Stack, Typography } from "@mui/material";
import { prismadb } from "@/lib/prisma";
import { AccountDetailActions } from "./AccountDetailActions";

function Detail({ label, children }: { label: string; children: ReactNode }) {
  return <Box sx={{ minWidth: 0, py: 0.5 }}><Typography variant="body2" sx={{ fontWeight: 600 }}>{label}</Typography><Typography variant="body2" color="text.secondary" component="div" sx={{ overflowWrap: "anywhere" }}>{children || "—"}</Typography></Box>;
}

function Address({ title, data, prefix }: { title: string; data: Record<string, string | null | undefined>; prefix: "billing" | "shipping" }) {
  return <Paper variant="outlined" sx={{ p: 3, borderRadius: "var(--radius)" }}>
    <Typography variant="h6" sx={{ fontWeight: 600 }}>{title}</Typography><Divider sx={{ my: 2 }} />
    <Stack spacing={1}>
      <Detail label={`${title.split(" ")[0]} street`}>{data[`${prefix}_street`]}</Detail>
      <Detail label={`${title.split(" ")[0]} postal code`}>{data[`${prefix}_postal_code`]}</Detail>
      <Detail label={`${title.split(" ")[0]} city`}>{data[`${prefix}_city`]}</Detail>
      <Detail label={`${title.split(" ")[0]} state`}>{data[`${prefix}_state`]}</Detail>
      <Detail label={`${title.split(" ")[0]} country`}>{data[`${prefix}_country`]}</Detail>
    </Stack>
  </Paper>;
}

export async function BasicView({ data }: { data: any }) {
  const users = await prismadb.users.findMany();
  if (!data) return <Typography>Account not found</Typography>;
  return <Stack spacing={2.5}>
    <Paper variant="outlined" sx={{ p: 3, borderRadius: "var(--radius)" }}>
      <Stack direction="row" sx={{ justifyContent: "space-between", alignItems: "flex-start" }}>
        <Box><Typography variant="h6" sx={{ fontWeight: 600 }}>{data.name}</Typography><Typography variant="body2" color="text.secondary">ID: {data.id}</Typography></Box>
        <AccountDetailActions account={data} />
      </Stack>
      <Divider sx={{ my: 2 }} />
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "repeat(2, minmax(0, 1fr))" }, gap: 2 }}>
        <Stack spacing={1}>
          <Detail label="Annual revenue">{data.annual_revenue}</Detail>
          <Detail label="Company ID">{data.company_id}</Detail>
          <Detail label="VAT number">{data.vat || "Not assigned"}</Detail>
          <Detail label="Description">{data.description}</Detail>
          <Detail label="Email">{data.email && <Link href={`mailto:${data.email}`}>{data.email}</Link>}</Detail>
          <Detail label="Website">{data.website && <Link href={data.website}>{data.website}</Link>}</Detail>
          <Detail label="Office phone">{data.office_phone}</Detail>
          <Detail label="Fax">{data.fax}</Detail>
        </Stack>
        <Stack spacing={1}>
          <Detail label="Assigned to">{data.assigned_to_user?.name || "Unassigned"}</Detail>
          <Detail label="Created">{data.created_on ? moment(data.created_on).format("MMM DD YYYY") : "—"}</Detail>
          <Detail label="Created by">{users.find((user) => user.id === data.createdBy)?.name}</Detail>
          <Detail label="Last update">{data.updatedAt ? moment(data.updatedAt).format("MMM DD YYYY") : "—"}</Detail>
          <Detail label="Last update by">{users.find((user) => user.id === data.updatedBy)?.name}</Detail>
          <Detail label="Status">{data.status}</Detail>
          <Detail label="Type">{data.type}</Detail>
          <Detail label="Member of">{data.member_of}</Detail>
          <Detail label="Industry">{data.industry}</Detail>
        </Stack>
      </Box>
    </Paper>
    <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, gap: 2.5 }}>
      <Address title="Billing Address" data={data} prefix="billing" />
      <Address title="Shipping Address" data={data} prefix="shipping" />
    </Box>
  </Stack>;
}
