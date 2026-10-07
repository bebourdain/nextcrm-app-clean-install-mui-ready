import { Box, Divider } from "@mui/material";
import { MuiPageHeader } from "@/components/mui/MuiPageHeader";
import TargetsView from "./components/TargetsView";
import { getTargets } from "@/actions/crm/get-targets";

export default async function TargetsPage() {
  const targets = await getTargets();
  return <Box sx={{ width: "100%", pb: 6 }}>
    <MuiPageHeader title="Targets" description="Manage your marketing and sales targets" />
    <Divider sx={{ my: 2 }} />
    <TargetsView data={targets} />
  </Box>;
}
