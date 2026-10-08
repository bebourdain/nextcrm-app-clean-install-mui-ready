"use client";
import { useState } from "react";
import { toast } from "sonner";
import { Box, Button, Divider, Drawer, MenuItem, Stack, TextField, Typography } from "@mui/material";
import { createActivity } from "@/actions/crm/activities/create-activity";
import { updateActivity } from "@/actions/crm/activities/update-activity";
import type { ActivityWithLinks } from "@/actions/crm/activities/get-activities-by-entity";

type ActivityType = "call" | "meeting" | "note" | "email";
type ActivityStatus = "scheduled" | "completed" | "cancelled";

const DEFAULT_STATUS: Record<ActivityType, ActivityStatus> = {
  call: "scheduled",
  meeting: "scheduled",
  note: "completed",
  email: "completed",
};

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  entityType: string;
  entityId: string;
  activity?: ActivityWithLinks; // if provided: edit mode
  onSaved: (activity: ActivityWithLinks) => void;
}

export function ActivityForm({ open, onOpenChange, entityType, entityId, activity, onSaved }: Props) {
  const isEdit = !!activity;

  const [type, setType] = useState<ActivityType>(activity?.type ?? "call");
  const [title, setTitle] = useState(activity?.title ?? "");
  const [description, setDescription] = useState(activity?.description ?? "");
  const [date, setDate] = useState(
    activity ? new Date(activity.date).toISOString().slice(0, 16) : ""
  );
  const [status, setStatus] = useState<ActivityStatus>(activity?.status ?? "scheduled");
  const [duration, setDuration] = useState(activity?.duration?.toString() ?? "");
  const [outcome, setOutcome] = useState(activity?.outcome ?? "");
  const [emailSubject, setEmailSubject] = useState(
    (activity?.metadata as Record<string, string> | null)?.subject ?? ""
  );
  const [saving, setSaving] = useState(false);

  const handleTypeChange = (nextType: ActivityType) => {
    setType(nextType);
    if (!isEdit) setStatus(DEFAULT_STATUS[nextType]);
  };

  const showDuration = type === "call" || type === "meeting";
  const showOutcome = type === "call" || type === "meeting";
  const showEmailSubject = type === "email";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error("Title is required");
      return;
    }
    if (!date) {
      toast.error("Date is required");
      return;
    }

    setSaving(true);

    const metadata: Record<string, unknown> = {};
    if (showEmailSubject && emailSubject) metadata.subject = emailSubject;

    const payload = {
      type,
      title: title.trim(),
      description: description.trim() || undefined,
      date: new Date(date),
      duration: showDuration && duration ? parseInt(duration, 10) : undefined,
      outcome: showOutcome && outcome.trim() ? outcome.trim() : undefined,
      status,
      metadata: Object.keys(metadata).length > 0 ? metadata : undefined,
      links: [{ entityType, entityId }],
    };

    let result: { data?: ActivityWithLinks; error?: string };

    if (isEdit) {
      result = await updateActivity({ id: activity.id, ...payload });
    } else {
      result = await createActivity(payload);
    }

    setSaving(false);

    if (result.error) {
      toast.error(result.error);
    } else if (result.data) {
      toast.success(isEdit ? "Activity updated" : "Activity logged");
      onSaved(result.data as ActivityWithLinks);
      onOpenChange(false);
    }
  };

  return (
    <Drawer anchor="right" open={open} onClose={() => onOpenChange(false)} slotProps={{ paper: { sx: { width: { xs: "100%", sm: 480 }, maxWidth: "100%" } } }}>
      <Box sx={{ p: 3 }}><Typography variant="h6">{isEdit ? "Edit Activity" : "Log Activity"}</Typography></Box>
      <Divider />
      <Box component="form" onSubmit={handleSubmit} sx={{ p: 3, overflowY: "auto", flex: 1 }}>
        <Stack spacing={2.5}>
          <TextField select fullWidth label="Type" value={type} onChange={(event) => handleTypeChange(event.target.value as ActivityType)}>
            <MenuItem value="call">Call</MenuItem><MenuItem value="meeting">Meeting</MenuItem><MenuItem value="note">Note</MenuItem><MenuItem value="email">Email</MenuItem>
          </TextField>
          <TextField fullWidth label="Title" value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Brief description" required />
          <TextField fullWidth label="Date & Time" type="datetime-local" value={date} onChange={(event) => setDate(event.target.value)} required slotProps={{ inputLabel: { shrink: true } }} />
          <TextField select fullWidth label="Status" value={status} onChange={(event) => setStatus(event.target.value as ActivityStatus)}>
            <MenuItem value="scheduled">Scheduled</MenuItem><MenuItem value="completed">Completed</MenuItem><MenuItem value="cancelled">Cancelled</MenuItem>
          </TextField>
          {showDuration && <TextField fullWidth label="Duration (minutes)" type="number" value={duration} onChange={(event) => setDuration(event.target.value)} placeholder="e.g. 30" slotProps={{ htmlInput: { min: 1 } }} />}
          {showOutcome && <TextField fullWidth label="Outcome" value={outcome} onChange={(event) => setOutcome(event.target.value)} placeholder="Result of the call / meeting" />}
          {showEmailSubject && <TextField fullWidth label="Email Subject" value={emailSubject} onChange={(event) => setEmailSubject(event.target.value)} placeholder="Subject line" />}
          <TextField fullWidth multiline minRows={4} label="Notes" value={description} onChange={(event) => setDescription(event.target.value)} placeholder="Additional notes..." />
          <Stack direction="row" spacing={1} sx={{ justifyContent: "flex-end" }}>
            <Button type="button" variant="outlined" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" variant="contained" disabled={saving}>{saving ? "Saving..." : isEdit ? "Save changes" : "Log activity"}</Button>
          </Stack>
        </Stack>
      </Box>
    </Drawer>
  );
}
