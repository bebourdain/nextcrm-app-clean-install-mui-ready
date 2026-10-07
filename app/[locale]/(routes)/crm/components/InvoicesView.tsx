"use client";

import Link from "next/link";
import { Plus } from "lucide-react";
import { Box, Button, Card, CardContent, Divider, Stack, Typography } from "@mui/material";
import { InvoicesTable } from "@/app/[locale]/(routes)/invoices/components/invoices-table";

interface InvoicesViewProps {
  data: any;
  accountId?: string;
  statusLabels?: Record<string, string>;
  tableLabels?: {
    number?: string;
    account?: string;
    issueDate?: string;
    dueDate?: string;
    total?: string;
    status?: string;
    type?: string;
    currency?: string;
  };
}

const InvoicesView = ({
  data,
  accountId,
  statusLabels,
  tableLabels,
}: InvoicesViewProps) => {
  return (
    <Card variant="outlined">
      <Box sx={{ p: 3, pb: 1.5 }}>
        <Stack direction="row" sx={{ justifyContent: "space-between", alignItems: "center", gap: 2 }}>
          <Typography variant="h5" component="h2"><Link href="/invoices" style={{ color: "inherit", textDecoration: "none" }}>Invoices</Link></Typography>
          {accountId && (
            <Button component={Link} href={`/invoices/new?accountId=${accountId}`} variant="contained" size="small" startIcon={<Plus size={16} />}>New invoice</Button>
          )}
        </Stack>
        <Divider sx={{ mt: 2.5 }} />
      </Box>
      <CardContent sx={{ pt: 1.5 }}>
        {!data || data.length === 0 ? (
          <Typography variant="body2" color="text.secondary">No assigned invoices found</Typography>
        ) : (
          <InvoicesTable
            invoices={data}
            statusLabels={statusLabels}
            tableLabels={tableLabels}
          />
        )}
      </CardContent>
    </Card>
  );
};

export default InvoicesView;
