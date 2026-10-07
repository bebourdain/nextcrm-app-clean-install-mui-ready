import { Box } from "@mui/material";
import { MuiPageHeader } from "@/components/mui/MuiPageHeader";
import { getCalendlySettings } from "@/lib/crm/calendar/calendly-settings";
import { CalendlyForm } from "./_components/CalendlyForm";

export default async function CalendarSettingsPage() {
  const settings = await getCalendlySettings();
  return <Box sx={{ p: 3 }}><MuiPageHeader title="Calendar settings" description="Calendly organization webhook for booked-call capture." /><Box sx={{ mt: 3 }}><CalendlyForm hasToken={Boolean(settings.apiToken)} hasSigningKey={Boolean(settings.signingKey)} webhookUri={settings.webhookUri} /></Box></Box>;
}
