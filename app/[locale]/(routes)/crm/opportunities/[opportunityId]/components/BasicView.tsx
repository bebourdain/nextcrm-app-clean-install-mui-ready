import type { ReactNode } from "react";
import { Box, Card, CardContent, CardHeader, Chip, Stack, Typography } from "@mui/material";
import {
  CalendarDays,
  Clapperboard,
  ClipboardList,
  CoinsIcon,
  Combine,
  Landmark,
  List,
  SquareStack,
  User,
} from "lucide-react";
import type { crm_Opportunities } from "@prisma/client";
import { Decimal } from "@prisma/client/runtime/client";
import moment from "moment";
import { cookies } from "next/headers";

import { prismadb } from "@/lib/prisma";
import { getAllCrmData } from "@/actions/crm/get-crm-data";
import { formatCurrency, convertAmount, getExchangeRates, getDefaultCurrency } from "@/lib/currency";
import { serializeDecimals } from "@/lib/serialize-decimals";
import { OpportunityDetailActions } from "./OpportunityDetailActions";
import RequestApprovalButton from "./RequestApprovalButton";

interface OppsViewProps {
  data: {
    assigned_sales_stage: { name: string } | null;
    assigned_to_user: { name: string | null } | null;
    assigned_account: { name: string } | null;
    assigned_type: { name: string } | null;
  } & crm_Opportunities;
}

function DetailField({ icon, label, value }: { icon: ReactNode; label: string; value: ReactNode }) {
  return (
    <Stack direction="row" spacing={1.5} sx={{ alignItems: "flex-start", p: 1, borderRadius: 1, "&:hover": { bgcolor: "action.hover" } }}>
      <Box sx={{ display: "flex", color: "text.secondary", mt: 0.25 }}>{icon}</Box>
      <Box sx={{ minWidth: 0 }}>
        <Typography variant="body2" sx={{ fontWeight: 600 }}>{label}</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ overflowWrap: "anywhere" }}>{value || "—"}</Typography>
      </Box>
    </Stack>
  );
}

export async function BasicView({ data }: OppsViewProps) {
  const users = await prismadb.users.findMany();
  const crmData = await getAllCrmData();
  const { saleTypes, saleStages, campaigns, currencies } = crmData;
  const cookieStore = await cookies();
  const defaultCurrency = await getDefaultCurrency();
  const displayCurrency = cookieStore.get("display_currency")?.value || defaultCurrency;
  const rates = await getExchangeRates();
  if (!data) return <Typography>Opportunity not found</Typography>;

  const fromCurrency = data.currency || "EUR";
  const budgetAmount = new Decimal(data.budget?.toString() ?? "0");
  const displayBudget = displayCurrency !== fromCurrency
    ? convertAmount(budgetAmount, fromCurrency, displayCurrency, rates)
    : null;
  const iconProps = { size: 18, strokeWidth: 1.8 };

  return (
    <Card>
      <CardHeader
        title={
          <Stack direction="row" spacing={1} sx={{ alignItems: "center", flexWrap: "wrap" }}>
            <Typography variant="h5" component="h2">{data.name}</Typography>
            {data.approval_status === "PENDING" && <Chip size="small" label="Approval pending" />}
            {data.approval_status === "APPROVED" && <Chip size="small" color="success" label="Approved" />}
            {data.approval_status === "REJECTED" && <Chip size="small" color="error" label="Rejected" title={data.approval_note ?? undefined} />}
          </Stack>
        }
        subheader={`ID: ${data.id}`}
        action={
          <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
            {(data.approval_status === "NONE" || data.approval_status === "REJECTED") && (
              <RequestApprovalButton opportunityId={data.id} />
            )}
            <OpportunityDetailActions
              opportunity={serializeDecimals(data)}
              saleTypes={saleTypes}
              saleStages={saleStages}
              campaigns={campaigns}
              currencies={currencies.map((currency: { code: string; name: string; symbol: string }) => ({
                code: currency.code,
                name: currency.name,
                symbol: currency.symbol,
              }))}
            />
          </Stack>
        }
        sx={{ pb: 1.5, "& .MuiCardHeader-action": { alignSelf: "center", m: 0 } }}
      />
      <CardContent sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "repeat(2, minmax(0, 1fr))" }, gap: 1, pt: 0 }}>
        <Box>
          <DetailField icon={<CoinsIcon {...iconProps} />} label="Opportunity amount" value={displayBudget ? formatCurrency(displayBudget, displayCurrency) : formatCurrency(budgetAmount, fromCurrency)} />
          <DetailField icon={<SquareStack {...iconProps} />} label="Sales stage" value={data.assigned_sales_stage?.name || "Not assigned"} />
          <DetailField icon={<Combine {...iconProps} />} label="Next step" value={data.next_step} />
          <DetailField icon={<ClipboardList {...iconProps} />} label="Description" value={data.description} />
          <DetailField icon={<User {...iconProps} />} label="Assigned to" value={data.assigned_to_user?.name || "Unassigned"} />
        </Box>
        <Box>
          <DetailField icon={<Landmark {...iconProps} />} label="Account name" value={data.assigned_account?.name || "Not assigned"} />
          <DetailField icon={<CalendarDays {...iconProps} />} label="Expected close date" value={data.close_date ? moment(data.close_date).format("MMM DD YYYY") : "—"} />
          <Stack direction="row" sx={{ "&:hover": { bgcolor: "action.hover" }, borderRadius: 1 }}>
            <DetailField icon={<CalendarDays {...iconProps} />} label="Date created" value={moment(data.createdAt).format("MMM DD YYYY")} />
            <DetailField icon={null} label="Created by" value={users.find((user) => user.id === data.createdBy)?.name} />
          </Stack>
          <Stack direction="row" sx={{ "&:hover": { bgcolor: "action.hover" }, borderRadius: 1 }}>
            <DetailField icon={<CalendarDays {...iconProps} />} label="Last update" value={moment(data.updatedAt).format("MMM DD YYYY")} />
            <DetailField icon={null} label="Last update by" value={users.find((user) => user.id === data.updatedBy)?.name} />
          </Stack>
          <DetailField icon={<List {...iconProps} />} label="Type" value={data.assigned_type?.name || "N/A"} />
          <DetailField icon={<Landmark {...iconProps} />} label="Lead source" value="Will be added in the future" />
          <DetailField icon={<Clapperboard {...iconProps} />} label="Campaign" value="Will be added in the future" />
        </Box>
      </CardContent>
    </Card>
  );
}
