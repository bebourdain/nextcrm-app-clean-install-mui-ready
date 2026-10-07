import type { ReactNode } from "react";
import Link from "next/link";
import moment from "moment";
import { Box, Card, CardContent, Chip, Divider, Stack, Typography } from "@mui/material";
import { Bell, Building2, CalendarDays, Coins, FileText, List, PenLine, User } from "lucide-react";
import { Decimal } from "@prisma/client/runtime/client";
import { prismadb } from "@/lib/prisma";
import { formatCurrency } from "@/lib/currency";

const statusLabel: Record<string, string> = { NOTSTARTED: "Not started", INPROGRESS: "In progress", SIGNED: "Signed" };
function Field({ icon, label, value }: { icon: ReactNode; label: string; value: ReactNode }) {
  return <Stack direction="row" spacing={1.5} sx={{ p: 1, alignItems: "flex-start", borderRadius: 1, "&:hover": { bgcolor: "action.hover" } }}>
    <Box sx={{ mt: 0.25, color: "text.secondary" }}>{icon}</Box>
    <Box><Typography variant="body2" sx={{ fontWeight: 600 }}>{label}</Typography><Typography variant="body2" color="text.secondary" component="div">{value}</Typography></Box>
  </Stack>;
}
export async function BasicView({ data }: { data: any }) {
  const users = await prismadb.users.findMany({ select: { id: true, name: true } });
  if (!data) return <Typography>Contract not found</Typography>;
  const date = (value: Date | null | undefined) => value ? moment(value).format("MMM DD, YYYY") : "N/A";
  const userName = (id: string | null | undefined) => users.find((user) => user.id === id)?.name ?? "N/A";
  return <Card variant="outlined">
    <Box sx={{ p: 3, pb: 1.5 }}><Stack direction="row" sx={{ justifyContent: "space-between", alignItems: "flex-start", gap: 2 }}>
      <Box><Typography variant="h5" component="h2">{data.title}</Typography><Typography variant="body2" color="text.secondary">ID: {data.id}</Typography></Box>
      <Chip size="small" color={data.status === "SIGNED" ? "success" : data.status === "INPROGRESS" ? "primary" : "default"} label={statusLabel[data.status] ?? data.status} />
    </Stack><Divider sx={{ mt: 2.5 }} /></Box>
    <CardContent sx={{ pt: 1.5 }}><Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, gap: 0.5 }}>
      <Field icon={<Coins size={18} />} label="Value" value={data.value != null ? formatCurrency(new Decimal(data.value.toString()), data.currency || "EUR") : "N/A"} />
      <Field icon={<List size={18} />} label="Type" value={data.type ?? "N/A"} />
      <Field icon={<CalendarDays size={18} />} label="Start Date" value={date(data.startDate)} />
      <Field icon={<CalendarDays size={18} />} label="End Date" value={date(data.endDate)} />
      <Field icon={<Bell size={18} />} label="Renewal Reminder" value={date(data.renewalReminderDate)} />
      <Field icon={<PenLine size={18} />} label="Customer Signed Date" value={date(data.customerSignedDate)} />
      <Field icon={<PenLine size={18} />} label="Company Signed Date" value={date(data.companySignedDate)} />
      <Field icon={<Building2 size={18} />} label="Assigned Account" value={data.assigned_account ? <Link href={`/crm/accounts/${data.assigned_account.id}`}>{data.assigned_account.name}</Link> : "N/A"} />
      <Field icon={<User size={18} />} label="Assigned To" value={data.assigned_to_user?.name ?? "N/A"} />
      <Field icon={<CalendarDays size={18} />} label="Created" value={`${date(data.createdAt)} · ${userName(data.createdBy)}`} />
      <Field icon={<CalendarDays size={18} />} label="Last Update" value={`${date(data.updatedAt)} · ${userName(data.updatedBy)}`} />
      <Field icon={<FileText size={18} />} label="Description" value={data.description || "N/A"} />
    </Box></CardContent>
  </Card>;
}
