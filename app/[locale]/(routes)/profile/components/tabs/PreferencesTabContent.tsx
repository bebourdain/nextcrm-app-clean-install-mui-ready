import { getTranslations } from "next-intl/server";
import { Paper, Typography } from "@mui/material";
import { LanguageForm } from "../LanguageForm";

export async function PreferencesTabContent({ userId }: { userId: string }) {
  const t = await getTranslations("ProfilePage");
  return <Paper variant="outlined" sx={{ p: 3 }}>
    <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>{t("cards.language")}</Typography>
    <LanguageForm userId={userId} />
  </Paper>;
}
