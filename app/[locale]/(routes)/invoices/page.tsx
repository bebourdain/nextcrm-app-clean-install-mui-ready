import { Box, Button, Divider, Paper } from "@mui/material";
import { MuiPageHeader } from "@/components/mui/MuiPageHeader";
import { getTranslations } from "next-intl/server";
import { getInvoices } from "./data/get-invoices";
import { InvoicesTable } from "./components/invoices-table";
import Link from "next/link";
import { Plus } from "lucide-react";

export default async function InvoicesPage() {
  const t = await getTranslations("InvoicesPage");
  const invoices = await getInvoices();

  const statusLabels: Record<string, string> = {
    DRAFT: t("status.DRAFT"),
    ISSUED: t("status.ISSUED"),
    SENT: t("status.SENT"),
    PARTIALLY_PAID: t("status.PARTIALLY_PAID"),
    PAID: t("status.PAID"),
    OVERDUE: t("status.OVERDUE"),
    CANCELLED: t("status.CANCELLED"),
    DISPUTED: t("status.DISPUTED"),
    REFUNDED: t("status.REFUNDED"),
    WRITTEN_OFF: t("status.WRITTEN_OFF"),
  };

  const tableLabels = {
    number: t("table.number"),
    account: t("table.account"),
    issueDate: t("table.issueDate"),
    dueDate: t("table.dueDate"),
    total: t("table.total"),
    status: t("table.status"),
    type: t("table.type"),
    currency: t("table.currency"),
  };

  return (
    <Box sx={{ width: "100%", pb: 6 }}>
      <MuiPageHeader title={t("title")} description={t("description")} action={<Button component={Link} href="/invoices/new" variant="contained" startIcon={<Plus size={16} />}>{t("new")}</Button>} />
      <Divider sx={{ my: 2 }} />
      <Paper variant="outlined" sx={{ p: 3, borderRadius: "var(--radius)" }}>
      <InvoicesTable
        invoices={JSON.parse(JSON.stringify(invoices))}
        statusLabels={statusLabels}
        tableLabels={tableLabels}
      />
      </Paper>
    </Box>
  );
}
