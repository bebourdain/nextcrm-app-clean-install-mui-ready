import { Box, Button, Chip, Divider, Grid, Paper, Stack, Typography } from "@mui/material";
import { MuiPageHeader } from "@/components/mui/MuiPageHeader";
import { pauseCampaign } from "@/actions/campaigns/pause-campaign";
import StepsTimeline from "./StepsTimeline";
import RecipientsTable from "./RecipientsTable";
import type { getCampaign } from "@/actions/campaigns/get-campaign";

type CampaignWithData = NonNullable<Awaited<ReturnType<typeof getCampaign>>>;

export default function CampaignDetail({ campaign }: { campaign: CampaignWithData }) {
  const sends = campaign.sends;
  const totalSent = sends.filter((s) => ["sent", "delivered", "bounced"].includes(s.status)).length;
  const delivered = sends.filter((s) => s.status === "delivered").length;
  const opened = sends.filter((s) => s.opened_at != null).length;
  const clicked = sends.filter((s) => s.clicked_at != null).length;
  const bounced = sends.filter((s) => s.status === "bounced").length;
  const openRate = totalSent > 0 ? Math.round((opened / totalSent) * 100) : 0;
  const clickRate = totalSent > 0 ? Math.round((clicked / totalSent) * 100) : 0;
  const canPause = campaign.status === "scheduled" || campaign.status === "sending";
  const color = campaign.status === "sent" ? "success" : campaign.status === "scheduled" ? "info" : campaign.status === "sending" || campaign.status === "paused" ? "warning" : "default";
  const metrics = [
    { label: "Sent", value: totalSent }, { label: "Delivered", value: delivered },
    { label: "Open Rate", value: `${openRate}%` }, { label: "Click Rate", value: `${clickRate}%` },
    { label: "Bounced", value: bounced },
  ];
  return <Stack spacing={2.5}>
    <MuiPageHeader title={campaign.name} description={campaign.description ?? undefined} action={<Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
      <Chip className="rounded-full" label={campaign.status?.toUpperCase() ?? "DRAFT"} color={color} size="small" />
      {canPause && <form action={async () => { "use server"; await pauseCampaign(campaign.id); }}><Button type="submit" variant="outlined">Pause</Button></form>}
    </Stack>} />
    <Divider />
    <Grid className="grid" container spacing={2} columns={{ xs: 2, sm: 4, lg: 5 }}>{metrics.map(({ label, value }) => <Grid key={label} size={1}>
      <Paper variant="outlined" sx={{ p: 2, textAlign: "center", borderRadius: "var(--radius)", height: "100%" }}>
        <Typography variant="h5" sx={{ fontWeight: 700 }}>{value}</Typography>
        <Typography variant="caption" color="text.secondary">{label}</Typography>
      </Paper>
    </Grid>)}</Grid>
    <Box><StepsTimeline steps={campaign.steps} /></Box>
    <Box><RecipientsTable sends={campaign.sends} /></Box>
  </Stack>;
}
