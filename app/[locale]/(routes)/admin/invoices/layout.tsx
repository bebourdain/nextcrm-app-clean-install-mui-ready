import { InvoicesTabs } from "./_components/InvoicesTabs";
import { Box, Divider } from "@mui/material";
import { MuiPageHeader } from "@/components/mui/MuiPageHeader";

export default function InvoicesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Box sx={{ width: "100%", pb: 6 }}>
      <MuiPageHeader title="Invoices" description="Manage invoice settings, number series, and tax rates." />
      <Divider sx={{ my: 2 }} />
      <InvoicesTabs />
      <Box sx={{ mt: 3 }}>{children}</Box>
    </Box>
  );
}
