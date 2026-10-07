"use client";

import type { ReactNode } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { Box, Divider, Tab, Tabs, Typography } from "@mui/material";
import { AccountCircleOutlined, CalendarMonthOutlined, CodeOutlined, EmailOutlined, KeyOutlined, LanguageOutlined, LockOutlined } from "@mui/icons-material";

type TabId = "profile" | "security" | "preferences" | "developer" | "emails" | "calendar" | "llms";
type Props = {
  profileContent: ReactNode; securityContent: ReactNode; preferencesContent: ReactNode;
  developerContent: ReactNode; emailsContent: ReactNode; calendarContent: ReactNode; llmsContent: ReactNode;
};
const ids: TabId[] = ["profile", "security", "preferences", "developer", "emails", "calendar", "llms"];

export function ProfileTabs({ profileContent, securityContent, preferencesContent, developerContent, emailsContent, calendarContent, llmsContent }: Props) {
  const t = useTranslations("ProfilePage");
  const router = useRouter();
  const searchParams = useSearchParams();
  const raw = searchParams.get("tab");
  const active: TabId = ids.includes(raw as TabId) ? raw as TabId : "profile";
  const tabs = [
    { id: "profile", label: t("tabs.profile"), desc: t("tabs.profileDesc"), icon: <AccountCircleOutlined /> },
    { id: "security", label: t("tabs.security"), desc: t("tabs.securityDesc"), icon: <LockOutlined /> },
    { id: "preferences", label: t("tabs.preferences"), desc: t("tabs.preferencesDesc"), icon: <LanguageOutlined /> },
    { id: "developer", label: t("tabs.developer"), desc: t("tabs.developerDesc"), icon: <CodeOutlined /> },
    { id: "emails", label: t("tabs.emails"), desc: t("tabs.emailsDesc"), icon: <EmailOutlined /> },
    { id: "calendar", label: t("tabs.calendar"), desc: t("tabs.calendarDesc"), icon: <CalendarMonthOutlined /> },
    { id: "llms", label: t("tabs.llms"), desc: t("tabs.llmsDesc"), icon: <KeyOutlined /> },
  ] as const;
  const content: Record<TabId, ReactNode> = { profile: profileContent, security: securityContent, preferences: preferencesContent, developer: developerContent, emails: emailsContent, calendar: calendarContent, llms: llmsContent };
  const meta = tabs.find((tab) => tab.id === active) ?? tabs[0];
  const change = (id: TabId) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", id);
    router.replace(`?${params.toString()}`, { scroll: false });
  };

  return <Box sx={{ minHeight: 480 }}>
    <Tabs value={active} onChange={(_, id: TabId) => change(id)} variant="scrollable" scrollButtons="auto" aria-label="Profile sections" sx={{ px: 2, borderBottom: 1, borderColor: "divider" }}>
      {tabs.map((tab) => <Tab key={tab.id} value={tab.id} label={tab.label} icon={tab.icon} iconPosition="start" sx={{ minHeight: 56 }} />)}
    </Tabs>
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      <Typography variant="h6">{meta.label}</Typography>
      <Typography color="text.secondary" variant="body2" sx={{ mt: 0.5, mb: 2 }}>{meta.desc}</Typography>
      <Divider sx={{ mb: 3 }} />
      {content[active]}
    </Box>
  </Box>;
}
