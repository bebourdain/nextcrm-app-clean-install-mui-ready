import { Box, Divider } from "@mui/material";
import { MuiPageHeader } from "@/components/mui/MuiPageHeader";
import { MuiLinkButton } from "@/components/mui/MuiLinkButton";
import { getCampaigns } from "@/actions/campaigns/get-campaigns";
import CampaignsView from "./components/CampaignsView";

export default async function CampaignsPage() {
  const campaigns = await getCampaigns();
  return <Box sx={{ width: "100%", pb: 6 }}>
    <MuiPageHeader title="Campaigns" description="Manage your email campaigns" action={<MuiLinkButton href="/campaigns/new" variant="contained">+ New Campaign</MuiLinkButton>} />
    <Divider sx={{ my: 2 }} />
    <CampaignsView data={campaigns} />
  </Box>;
}
