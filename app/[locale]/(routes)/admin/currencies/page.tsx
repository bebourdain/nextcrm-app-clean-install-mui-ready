import { Box, Paper, Stack, Typography } from "@mui/material";
import { MuiPageHeader } from "@/components/mui/MuiPageHeader";
import { getCurrencies, getExchangeRatesAdmin, getEcbAutoUpdate } from "./_actions/currencies";
import { CurrencyTable } from "./_components/CurrencyTable";
import { ExchangeRatesTable } from "./_components/ExchangeRatesTable";
import { ECBToggle } from "./_components/ECBToggle";

export default async function CurrenciesPage() {
  const [currencies, rates, ecbEnabled] = await Promise.all([getCurrencies(), getExchangeRatesAdmin(), getEcbAutoUpdate()]);
  return <Box sx={{ p: 3 }}><MuiPageHeader title="Currencies" description="Manage available currencies and exchange rates." /><Stack spacing={3} sx={{ mt: 3 }}><Paper variant="outlined" sx={{ p: 2 }}><Typography variant="h6" sx={{ mb: 2 }}>Currencies</Typography><CurrencyTable currencies={currencies} /></Paper><Paper variant="outlined" sx={{ p: 2 }}><Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ justifyContent: "space-between", alignItems: { sm: "center" }, mb: 2 }}><Typography variant="h6">Exchange Rates</Typography><ECBToggle initialEnabled={ecbEnabled} /></Stack><ExchangeRatesTable rates={rates} ecbEnabled={ecbEnabled} /></Paper></Stack></Box>;
}
