"use client";
import { useState } from "react";
import { Alert, Box, Button, FormControlLabel, MenuItem, Paper, Radio, RadioGroup, Stack, TextField, Typography } from "@mui/material";

type FollowUpStep = { order: number; template_id: string; subject: string; delay_days: number; send_to: "all" | "non_openers" };
type Template = { id: string; name: string };
type Props = {
  initialData: { send_now?: boolean; scheduled_at?: Date; followUpSteps?: FollowUpStep[] };
  templates: Template[];
  onSubmit: (data: { send_now: boolean; scheduled_at?: Date; followUpSteps: FollowUpStep[] }) => Promise<void>;
  onBack: () => void;
  isSubmitting: boolean;
};

export function Step4Schedule({ initialData, templates, onSubmit, onBack, isSubmitting }: Props) {
  const [sendNow, setSendNow] = useState(initialData.send_now ?? false);
  const [scheduledAt, setScheduledAt] = useState(() => initialData.scheduled_at ? new Date(initialData.scheduled_at).toISOString().slice(0, 16) : "");
  const [followUps, setFollowUps] = useState<FollowUpStep[]>(initialData.followUpSteps ?? []);
  const [error, setError] = useState("");
  const addFollowUp = () => setFollowUps((previous) => [...previous, { order: previous.length + 1, template_id: templates[0]?.id ?? "", subject: "", delay_days: 3, send_to: "all" }]);
  const removeFollowUp = (index: number) => setFollowUps((previous) => previous.filter((_, itemIndex) => itemIndex !== index).map((item, itemIndex) => ({ ...item, order: itemIndex + 1 })));
  const updateFollowUp = (index: number, patch: Partial<FollowUpStep>) => setFollowUps((previous) => previous.map((item, itemIndex) => itemIndex === index ? { ...item, ...patch } : item));
  const handleSubmit = async () => {
    if (!sendNow && !scheduledAt) { setError("Pick a date or choose Send Now"); return; }
    await onSubmit({ send_now: sendNow, scheduled_at: sendNow ? undefined : new Date(scheduledAt), followUpSteps: followUps });
  };
  return <Stack spacing={3} sx={{ maxWidth: 680 }}>
    <Box>
      <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>When to send</Typography>
      <RadioGroup row value={sendNow ? "now" : "later"} onChange={(event) => { setSendNow(event.target.value === "now"); setError(""); }}>
        <FormControlLabel value="now" control={<Radio />} label="Send now" />
        <FormControlLabel value="later" control={<Radio />} label="Schedule for later" />
      </RadioGroup>
      {!sendNow && <TextField type="datetime-local" label="Scheduled date and time" value={scheduledAt} onChange={(event) => setScheduledAt(event.target.value)} slotProps={{ inputLabel: { shrink: true } }} sx={{ mt: 1, width: { xs: "100%", sm: 300 } }} />}
    </Box>
    <Stack spacing={1.5}>
      <Typography variant="body2" sx={{ fontWeight: 600 }}>Follow-up Steps</Typography>
      {!followUps.length && <Typography variant="body2" color="text.secondary">No follow-ups. Add one below.</Typography>}
      {followUps.map((followUp, index) => <Paper key={index} variant="outlined" sx={{ p: 2, borderRadius: "var(--radius)" }}><Stack spacing={2}>
        <Stack direction="row" sx={{ alignItems: "center", justifyContent: "space-between" }}>
          <Typography variant="body2" sx={{ fontWeight: 600 }}>Follow-up {index + 1}</Typography>
          <Button size="small" color="error" onClick={() => removeFollowUp(index)}>Remove</Button>
        </Stack>
        <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
          <TextField fullWidth type="number" label="Delay (days after previous)" value={followUp.delay_days} onChange={(event) => updateFollowUp(index, { delay_days: parseInt(event.target.value) || 1 })} slotProps={{ htmlInput: { min: 1 } }} />
          <TextField fullWidth select label="Send to" value={followUp.send_to} onChange={(event) => updateFollowUp(index, { send_to: event.target.value as "all" | "non_openers" })}>
            <MenuItem value="all">All recipients</MenuItem><MenuItem value="non_openers">Non-openers only</MenuItem>
          </TextField>
        </Stack>
        <TextField fullWidth select label="Template" value={followUp.template_id} onChange={(event) => updateFollowUp(index, { template_id: event.target.value })}>
          {templates.map((template) => <MenuItem key={template.id} value={template.id}>{template.name}</MenuItem>)}
        </TextField>
        <TextField fullWidth label="Subject" value={followUp.subject} onChange={(event) => updateFollowUp(index, { subject: event.target.value })} placeholder="Follow-up subject line..." />
      </Stack></Paper>)}
      <Box><Button variant="outlined" onClick={addFollowUp}>+ Add follow-up</Button></Box>
    </Stack>
    {error && <Alert severity="error">{error}</Alert>}
    <Stack direction="row" sx={{ justifyContent: "space-between" }}><Button variant="outlined" onClick={onBack}>← Back</Button><Button variant="contained" onClick={handleSubmit} disabled={isSubmitting}>{isSubmitting ? "Submitting..." : "Submit Campaign"}</Button></Stack>
  </Stack>;
}
