import { Suspense } from "react";
import Link from "next/link";
import { Box, Button, Divider, Skeleton } from "@mui/material";
import { MuiPageHeader } from "@/components/mui/MuiPageHeader";
import { getTemplates } from "@/actions/campaigns/templates/get-templates";
import TemplatesView from "./components/TemplatesView";

export default async function TemplatesPage() {
  const templates = await getTemplates();
  return (
    <Box sx={{ width: "100%", pb: 6 }}>
      <MuiPageHeader title="Campaign Templates" description="Reusable email templates" action={<Button component={Link} href="/campaigns/templates/new" variant="contained">+ New Template</Button>} />
      <Divider sx={{ my: 2 }} />
      <Suspense fallback={<Skeleton variant="rounded" height={360} />}>
        <TemplatesView data={templates} />
      </Suspense>
    </Box>
  );
}
