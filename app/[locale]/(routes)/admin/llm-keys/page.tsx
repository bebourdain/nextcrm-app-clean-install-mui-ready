import { Alert, Box, Stack, Typography } from "@mui/material";
import { MuiPageHeader } from "@/components/mui/MuiPageHeader";
import { getSystemApiKeys } from "../actions/api-keys";
import { ProviderKeyCard } from "./ProviderKeyCard";
import { getSession } from "@/lib/auth-server";
import { getTranslations } from "next-intl/server";

export default async function LlmKeysPage() {
  const session = await getSession();
  const t = await getTranslations("AdminPage");
  if (session?.user?.role !== "admin") return <Box sx={{ p: 3 }}><MuiPageHeader title="AI Provider Keys" description="LLM API key management" /><Typography>{t("accessNotAllowed")}</Typography></Box>;
  const keys = await getSystemApiKeys();
  return <Box sx={{ p: 3 }}><MuiPageHeader title="AI Provider Keys" description="Priority: ENV → System-wide → User profile" /><Stack spacing={2} sx={{ maxWidth: 680, mt: 3 }}><Alert severity="info">System-wide keys are used when no ENV variable is set. Users can configure their own keys in profile settings.</Alert>{keys.map((status) => <ProviderKeyCard key={status.provider} status={status} />)}</Stack></Box>;
}
