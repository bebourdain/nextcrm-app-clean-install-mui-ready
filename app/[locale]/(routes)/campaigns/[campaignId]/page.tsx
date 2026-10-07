import { notFound } from "next/navigation";
import { Box } from "@mui/material";
import { getCampaign } from "@/actions/campaigns/get-campaign";
import CampaignDetail from "./components/CampaignDetail";

export default async function CampaignDetailPage({ params }: { params: Promise<{ campaignId: string }> }) {
  const { campaignId } = await params;
  const campaign = await getCampaign(campaignId);
  if (!campaign || campaign.status === "deleted") notFound();
  return <Box sx={{ width: "100%", pb: 6 }}><CampaignDetail campaign={campaign} /></Box>;
}
