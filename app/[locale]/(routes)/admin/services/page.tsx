import { Box, Typography } from "@mui/material";
import { MuiPageHeader } from "@/components/mui/MuiPageHeader";
import ResendCard from "../_components/ResendCard";
import { getSession } from "@/lib/auth-server";
import { getTranslations } from "next-intl/server";

export default async function ServicesPage() {
  const session = await getSession();
  const t = await getTranslations("AdminPage");
  if (session?.user?.role !== "admin") return <Box sx={{ p: 3 }}><MuiPageHeader title="Services" description="System service integrations" /><Typography>{t("accessNotAllowed")}</Typography></Box>;
  return <Box sx={{ p: 3 }}><MuiPageHeader title="Services" description="System service integrations. Priority: ENV → System-wide (DB)." /><Box sx={{ maxWidth: 680, mt: 3 }}><ResendCard /></Box></Box>;
}
