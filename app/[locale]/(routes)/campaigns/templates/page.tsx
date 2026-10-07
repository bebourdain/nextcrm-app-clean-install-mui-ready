import { Suspense } from "react";
import { Box, Divider, Skeleton } from "@mui/material";
import { MuiPageHeader } from "@/components/mui/MuiPageHeader";
import { MuiLinkButton } from "@/components/mui/MuiLinkButton";
import { getTemplates } from "@/actions/campaigns/templates/get-templates";
import TemplatesView from "./components/TemplatesView";

export default async function TemplatesPage() {
  const templates = await getTemplates();
  return (
    <Box sx={{ width: "100%", pb: 6 }}>
      <MuiPageHeader title="Campaign Templates" description="Reusable email templates" action={<MuiLinkButton href="/campaigns/templates/new" variant="contained">+ New Template</MuiLinkButton>} />
      <Divider sx={{ my: 2 }} />
      <Suspense fallback={<Skeleton variant="rounded" height={360} />}>
        <TemplatesView data={templates} />
      </Suspense>
    </Box>
  );
}
