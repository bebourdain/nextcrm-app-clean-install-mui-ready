import { Avatar, Box, Chip, Paper, Stack, Typography } from "@mui/material";

type Step = {
  id: string; order: number; subject: string; send_to: string; scheduled_at: Date | null; sent_at: Date | null;
  delay_days: number; template: { name: string } | null; sends: Array<{ status: string; opened_at: Date | null }>;
};

export default function StepsTimeline({ steps }: { steps: Step[] }) {
  return <Stack spacing={1.5}>
    <Typography variant="h6" component="h2" sx={{ fontWeight: 600 }}>Campaign Steps</Typography>
    {steps.map((step, i) => {
      const sent = step.sends.filter((send) => ["sent", "delivered"].includes(send.status)).length;
      const opened = step.sends.filter((send) => send.opened_at != null).length;
      const openRate = sent > 0 ? Math.round((opened / sent) * 100) : 0;
      const label = step.sent_at ? `Sent ${new Date(step.sent_at).toLocaleDateString()}` : step.scheduled_at ? `Scheduled ${new Date(step.scheduled_at).toLocaleDateString()}` : "Pending";
      const color = step.sent_at ? "success" : step.scheduled_at ? "info" : "default";
      return <Paper key={step.id} variant="outlined" sx={{ p: 2, borderRadius: "var(--radius)" }}>
        <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ alignItems: { sm: "center" } }}>
          <Avatar sx={{ width: 32, height: 32, bgcolor: "primary.main", fontSize: 14 }}>{i + 1}</Avatar>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>{i === 0 ? "Initial Send" : `Follow-up ${i}`} — {step.subject}</Typography>
            <Typography variant="caption" color="text.secondary">Template: {step.template?.name ?? "—"} · {step.delay_days > 0 ? `+${step.delay_days} days` : "initial"} · {step.send_to === "non_openers" ? "Non-openers only" : "All recipients"}</Typography>
          </Box>
          <Stack spacing={0.5} sx={{ alignItems: { sm: "flex-end" } }}><Chip size="small" color={color} label={label} />{sent > 0 && <Typography variant="caption" color="text.secondary">{sent} sent · {openRate}% opens</Typography>}</Stack>
        </Stack>
      </Paper>;
    })}
    {!steps.length && <Typography variant="body2" color="text.secondary">No steps configured.</Typography>}
  </Stack>;
}
