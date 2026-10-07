import { Box, Paper, Typography } from "@mui/material";
import { getTranslations } from "next-intl/server";
import { MuiPageHeader } from "@/components/mui/MuiPageHeader";

export default async function EmployeesPage() {
  const t = await getTranslations("EmployeesPage");
  return <Box sx={{ p: { xs: 2, md: 3 } }}>
    <MuiPageHeader title={t("title")} description={t("description")} />
    <Paper variant="outlined" sx={{ p: 3, mt: 3 }}>
      <Typography color="text.secondary">{t("moduleContent")}</Typography>
    </Paper>
  </Box>;
}
