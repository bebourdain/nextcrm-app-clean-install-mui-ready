import { prismadb } from "@/lib/prisma";
import { Paper, Typography } from "@mui/material";
import { SeriesTable } from "./_components/SeriesTable";

export default async function InvoiceSeriesPage() {
  const series = await prismadb.invoice_Series.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <Paper variant="outlined" sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>Invoice Series</Typography>
          <SeriesTable series={JSON.parse(JSON.stringify(series))} />
    </Paper>
  );
}
