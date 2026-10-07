import React, { Suspense } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Box, Divider, Paper, Typography } from "@mui/material";
import { MuiPageHeader } from "@/components/mui/MuiPageHeader";
import { MuiLinkButton } from "@/components/mui/MuiLinkButton";
import { MailComponent } from "./components/mail";
import { EmailsSkeleton } from "./components/emails-skeleton";
import { getSession } from "@/lib/auth-server";
import { getTranslations } from "next-intl/server";
import { getEmailAccounts } from "@/actions/emails/accounts";
import { getEmails } from "@/actions/emails/messages";
import { EmailFolder } from "@prisma/client";

const EmailRoute = async ({
  searchParams,
}: {
  searchParams: Promise<{ accountId?: string; folder?: string; search?: string; page?: string }>;
}) => {
  const session = await getSession();

  if (!session) {
    redirect("/");
  }

  const t = await getTranslations("ModuleMenu");
  const params = await searchParams;

  const layout = (await cookies()).get("react-resizable-panels:layout");
  const collapsed = (await cookies()).get("react-resizable-panels:collapsed");

  // Parse layout with validation - ensure left panel is visible
  const FALLBACK_LAYOUT = [20, 35, 45];
  let validatedLayout: number[] | undefined;

  if (layout) {
    try {
      const parsed = JSON.parse(layout.value);
      if (
        Array.isArray(parsed) &&
        parsed.length === 3 &&
        parsed.every((n: number) => typeof n === "number" && n > 0) &&
        parsed[0] >= 18
      ) {
        validatedLayout = parsed;
      } else {
        validatedLayout = FALLBACK_LAYOUT;
      }
    } catch {
      validatedLayout = FALLBACK_LAYOUT;
    }
  }

  const defaultCollapsed = collapsed ? JSON.parse(collapsed.value) : undefined;

  const connectedAccounts = await getEmailAccounts();

  if (connectedAccounts.length === 0) {
    return (
      <Box sx={{ width: "100%", pb: 6 }}>
        <MuiPageHeader title={t("emails")} description="Your connected mailboxes" />
        <Divider sx={{ my: 2 }} />
        <Paper variant="outlined" sx={{ p: 6, textAlign: "center" }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>You don&apos;t have any mailbox registered yet.</Typography>
          <MuiLinkButton href="/profile" variant="outlined">Go to your profile to set up your first mailbox</MuiLinkButton>
        </Paper>
      </Box>
    );
  }

  const activeAccountId = params.accountId ?? connectedAccounts[0]?.id;
  const activeFolder = params.folder === "SENT" ? EmailFolder.SENT : EmailFolder.INBOX;

  const activePage = Math.max(1, parseInt(params.page ?? "1", 10) || 1);
  const emailsResult = activeAccountId
    ? await getEmails(activeAccountId, activeFolder, activePage, params.search)
    : { emails: [], total: 0, page: 1, totalPages: 0 };

  return (
    <Box sx={{ width: "100%", pb: 6 }}>
      <MuiPageHeader title={t("emails")} description="Your connected mailboxes" />
      <Divider sx={{ my: 2 }} />
      <Suspense fallback={<EmailsSkeleton />}>
        <MailComponent
          accounts={connectedAccounts}
          mails={emailsResult.emails}
          activeAccountId={activeAccountId ?? null}
          activeFolder={activeFolder}
          page={emailsResult.page}
          totalPages={emailsResult.totalPages}
          defaultLayout={validatedLayout}
          defaultCollapsed={defaultCollapsed}
          navCollapsedSize={8}
        />
      </Suspense>
    </Box>
  );
};

export default EmailRoute;
