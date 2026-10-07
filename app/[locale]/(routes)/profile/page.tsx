import { Suspense } from "react";
import { Box, Paper, Typography } from "@mui/material";
import { getUser } from "@/actions/get-user";
import { getTranslations } from "next-intl/server";
import { MuiPageHeader } from "@/components/mui/MuiPageHeader";
import { ProfileHero } from "./components/ProfileHero";
import { ProfileTabs } from "./components/ProfileTabs";
import { ProfileTabContent } from "./components/tabs/ProfileTabContent";
import { SecurityTabContent } from "./components/tabs/SecurityTabContent";
import { PreferencesTabContent } from "./components/tabs/PreferencesTabContent";
import { DeveloperTabContent } from "./components/tabs/DeveloperTabContent";
import { EmailAccountsTabContent } from "./components/tabs/EmailAccountsTabContent";
import { CalendarTabContent } from "./components/tabs/CalendarTabContent";
import { LlmsTabContent } from "./components/tabs/LlmsTabContent";
import { getUserApiKeys } from "./actions/api-keys";

export default async function ProfilePage() {
  const t = await getTranslations("ProfilePage");
  const data = await getUser();
  if (!data) return <Box sx={{ p: 3 }}><Typography>No user data.</Typography></Box>;
  const llmKeys = await getUserApiKeys();

  return <Box sx={{ p: { xs: 2, md: 3 } }}>
    <MuiPageHeader title={t("title")} description={t("description")} />
    <Paper variant="outlined" sx={{ mt: 3, overflow: "hidden" }}>
      <ProfileHero data={data} />
      <Suspense fallback={<Typography sx={{ p: 3 }}>Loading...</Typography>}>
        <ProfileTabs
          profileContent={<ProfileTabContent data={data} />}
          securityContent={<SecurityTabContent userId={data.id} />}
          preferencesContent={<PreferencesTabContent userId={data.id} />}
          developerContent={<DeveloperTabContent userId={data.id} />}
          emailsContent={<EmailAccountsTabContent />}
          calendarContent={<CalendarTabContent />}
          llmsContent={<LlmsTabContent initialKeys={llmKeys} />}
        />
      </Suspense>
    </Paper>
  </Box>;
}
