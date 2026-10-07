import { Box, Divider } from "@mui/material";
import { MuiPageHeader } from "@/components/mui/MuiPageHeader";
import { WizardShell } from "./components/WizardShell";
import { getTemplates } from "@/actions/campaigns/templates/get-templates";
import { prismadb } from "@/lib/prisma";

export default async function NewCampaignPage() {
  const [templates, targetLists] = await Promise.all([
    getTemplates(),
    prismadb.crm_TargetLists.findMany({
      where: { status: true },
      orderBy: { name: "asc" },
      include: { _count: { select: { targets: true } } },
    }),
  ]);
  return <Box sx={{ width: "100%", pb: 6 }}>
    <MuiPageHeader title="New Campaign" description="Create an email campaign" />
    <Divider sx={{ my: 2 }} />
    <WizardShell templates={templates} targetLists={targetLists} />
  </Box>;
}
