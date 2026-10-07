import { Box, Divider } from "@mui/material";
import { MuiPageHeader } from "@/components/mui/MuiPageHeader";
import { BasicView } from "./components/BasicView";
import { getTarget } from "@/actions/crm/get-target";

export default async function TargetViewPage({ params }: { params: Promise<{ targetId: string }> }) {
  const { targetId } = await params;
  const target = await getTarget(targetId);
  if (!target) return <Box>Target not found</Box>;
  return <Box sx={{ width: "100%", pb: 6 }}>
    <MuiPageHeader title={`Target detail view: ${target.first_name || ""} ${target.last_name || ""}`} description="Everything you need to know about this target" />
    <Divider sx={{ my: 2 }} />
    <BasicView data={target} />
  </Box>;
}
