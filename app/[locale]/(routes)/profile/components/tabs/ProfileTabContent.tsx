import type { Users } from "@prisma/client";
import { getTranslations } from "next-intl/server";
import { Paper, Stack, Typography } from "@mui/material";
import { ProfilePhotoForm } from "../ProfilePhotoForm";
import { ProfileForm } from "../ProfileForm";

export async function ProfileTabContent({ data }: { data: Users }) {
  const t = await getTranslations("ProfilePage");
  return <Stack spacing={2}>
    <Paper variant="outlined" sx={{ p: 3 }}><Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>{t("cards.photo")}</Typography><ProfilePhotoForm data={data} /></Paper>
    <Paper variant="outlined" sx={{ p: 3 }}><Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>{t("cards.personalInfo")}</Typography><ProfileForm data={data} /></Paper>
  </Stack>;
}
