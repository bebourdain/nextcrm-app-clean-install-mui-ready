import type { Users } from "@prisma/client";
import { getTranslations } from "next-intl/server";
import { Box, Chip, Stack, Typography } from "@mui/material";
import { ProfileHeroAvatar } from "./ProfileHeroAvatar";

export async function ProfileHero({ data }: { data: Users }) {
  const t = await getTranslations("ProfilePage");
  return <Stack direction="row" spacing={2} sx={{ alignItems: "center", p: 3, bgcolor: "primary.main", color: "primary.contrastText" }}>
    <ProfileHeroAvatar avatar={data.avatar} name={data.name} />
    <Box><Typography variant="h6" sx={{ fontWeight: 700 }}>{data.name}</Typography>
      <Typography variant="body2" sx={{ opacity: 0.85 }}>{data.email}</Typography>
      <Chip label={t("hero.role")} size="small" sx={{ mt: 1, color: "inherit", bgcolor: "rgba(255,255,255,0.2)" }} />
    </Box>
  </Stack>;
}
