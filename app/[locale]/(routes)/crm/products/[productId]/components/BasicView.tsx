import { Box, Chip, Divider, Paper, Stack, Typography } from "@mui/material";
import { Decimal } from "@prisma/client/runtime/client";
import { formatCurrency } from "@/lib/currency";

interface BasicViewProps {
  data: {
    id: string; name: string; sku: string | null; type: string; status: string;
    description: string | null; unit_price: number; unit_cost: number | null;
    currency: string; tax_rate: number | null; unit: string | null;
    is_recurring: boolean; billing_period: string | null;
    category: { id: string; name: string } | null;
    created_by_user: { id: string; name: string | null } | null;
    createdAt: Date; updatedAt: Date;
  };
}

function DetailRow({ label, value }: { label: string; value: string | number | null | undefined }) {
  return <Stack direction={{ xs: "column", sm: "row" }} spacing={1} sx={{ py: 1.5 }}>
    <Typography variant="body2" color="text.secondary" sx={{ width: { sm: 150 }, flexShrink: 0 }}>{label}</Typography>
    <Typography variant="body2" sx={{ overflowWrap: "anywhere" }}>{value === null || value === undefined || value === "" ? "N/A" : value}</Typography>
  </Stack>;
}

export function BasicView({ data }: BasicViewProps) {
  const money = (value: number | null) => value === null ? "N/A" : formatCurrency(new Decimal(value.toString()), data.currency || "EUR");
  const date = (value: Date) => value ? new Intl.DateTimeFormat("en-US", { dateStyle: "medium" }).format(new Date(value)) : "N/A";
  const margin = data.unit_price > 0 && data.unit_cost !== null ? `${(((data.unit_price - data.unit_cost) / data.unit_price) * 100).toFixed(1)}%` : "N/A";
  return <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", lg: "1fr 1fr" }, gap: 2.5 }}>
    <Paper variant="outlined" sx={{ p: 3 }}>
      <Stack direction="row" sx={{ mb: 2, justifyContent: "space-between", alignItems: "center" }}>
        <Typography variant="h6">Product Information</Typography>
        <Chip size="small" color={data.status === "ACTIVE" ? "success" : data.status === "ARCHIVED" ? "warning" : "default"} label={data.status.charAt(0) + data.status.slice(1).toLowerCase()} />
      </Stack>
      <Divider />
      <DetailRow label="Name" value={data.name} /><Divider />
      <DetailRow label="SKU" value={data.sku} /><Divider />
      <DetailRow label="Type" value={data.type} /><Divider />
      <DetailRow label="Category" value={data.category?.name} /><Divider />
      <DetailRow label="Description" value={data.description} /><Divider />
      <DetailRow label="Created By" value={data.created_by_user?.name} /><Divider />
      <DetailRow label="Created" value={date(data.createdAt)} /><Divider />
      <DetailRow label="Last Update" value={date(data.updatedAt)} />
    </Paper>
    <Paper variant="outlined" sx={{ p: 3 }}>
      <Typography variant="h6" sx={{ mb: 2 }}>Pricing</Typography>
      <Divider />
      <DetailRow label="Unit Price" value={money(data.unit_price)} /><Divider />
      <DetailRow label="Unit Cost" value={money(data.unit_cost)} /><Divider />
      <DetailRow label="Margin" value={margin} /><Divider />
      <DetailRow label="Tax Rate" value={data.tax_rate !== null ? `${data.tax_rate}%` : null} /><Divider />
      <DetailRow label="Unit" value={data.unit} /><Divider />
      <DetailRow label="Recurring" value={data.is_recurring ? "Yes" : "No"} />
      {data.is_recurring && data.billing_period && <><Divider /><DetailRow label="Billing Period" value={data.billing_period} /></>}
    </Paper>
  </Box>;
}
