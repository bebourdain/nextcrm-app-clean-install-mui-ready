import { Box, Divider } from "@mui/material";
import { MuiPageHeader } from "@/components/mui/MuiPageHeader";
import { BasicView } from "./components/BasicView";
import { getTargetList } from "@/actions/crm/get-target-list";

export default async function TargetListViewPage({ params }: { params: Promise<{ targetListId: string }> }) {
  const { targetListId } = await params;
  const targetList = await getTargetList(targetListId);
  if (!targetList) return <Box>Target list not found</Box>;
  return <Box sx={{ width: "100%", pb: 6 }}>
    <MuiPageHeader title={`Target List: ${targetList.name}`} description="View and manage targets in this list" />
    <Divider sx={{ my: 2 }} />
    <BasicView data={targetList} />
  </Box>;
}
