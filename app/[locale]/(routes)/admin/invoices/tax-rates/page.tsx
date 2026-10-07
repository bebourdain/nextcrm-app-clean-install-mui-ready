import { prismadb } from "@/lib/prisma";
import { Paper, Typography } from "@mui/material";
import { TaxRatesTable } from "./_components/TaxRatesTable";

export default async function TaxRatesPage() {
  const rates = await prismadb.invoice_TaxRates.findMany({
    orderBy: { rate: "desc" },
  });

  return (
    <Paper variant="outlined" sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>Tax Rates</Typography>
          <TaxRatesTable rates={JSON.parse(JSON.stringify(rates))} />
    </Paper>
  );
}
