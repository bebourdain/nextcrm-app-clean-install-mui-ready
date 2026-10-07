import { Box, Divider } from "@mui/material";
import { MuiPageHeader } from "@/components/mui/MuiPageHeader";
import TargetListsView from "./components/TargetListsView";
import { getTargetLists } from "@/actions/crm/get-target-lists";

export default async function TargetListsPage() {
  const targetLists = await getTargetLists();
  return <Box sx={{ width: "100%", pb: 6 }}>
    <MuiPageHeader title="Target Lists" description="Manage your target lists for campaigns and outreach" />
    <Divider sx={{ my: 2 }} />
    <TargetListsView data={targetLists} />
  </Box>;
}
