import { prismadb } from "@/lib/prisma";
import { Paper, Typography } from "@mui/material";
import { InvoiceSettingsForm } from "./_components/InvoiceSettingsForm";

export default async function InvoiceSettingsPage() {
  const [settings, currencies, series, taxRates] = await Promise.all([
    prismadb.invoice_Settings.findFirst(),
    prismadb.currency.findMany({
      where: { isEnabled: true },
      orderBy: { code: "asc" },
    }),
    prismadb.invoice_Series.findMany({
      where: { active: true },
      orderBy: { name: "asc" },
    }),
    prismadb.invoice_TaxRates.findMany({
      where: { active: true },
      orderBy: { rate: "desc" },
    }),
  ]);

  return (
    <Paper variant="outlined" sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>Invoice Settings</Typography>
          <InvoiceSettingsForm
            settings={settings ? JSON.parse(JSON.stringify(settings)) : null}
            currencies={JSON.parse(JSON.stringify(currencies))}
            series={JSON.parse(JSON.stringify(series))}
            taxRates={JSON.parse(JSON.stringify(taxRates))}
          />
    </Paper>
  );
}
