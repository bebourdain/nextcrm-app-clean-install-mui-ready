import { getTranslations } from "next-intl/server";
import { Paper, Typography } from "@mui/material";

export async function SecurityTabContent({ userId: _userId }: { userId: string }) {
  const t = await getTranslations("ProfilePage");
  return <Paper variant="outlined" sx={{ p: 3 }}>
    <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>{t("cards.changePassword")}</Typography>
    <Typography color="text.secondary">Password management is handled via your identity provider.</Typography>
  </Paper>;
}
