import { Box } from "@mui/material";
import { getFunnelSettings } from "@/lib/crm/funnel-settings";
import FunnelSettingsForm from "./_components/FunnelSettingsForm";

export default async function FunnelSettingsPage() {
  const settings = await getFunnelSettings();
  return <Box sx={{ p: 3 }}><FunnelSettingsForm initial={settings} /></Box>;
}
