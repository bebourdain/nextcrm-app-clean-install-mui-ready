"use client";

import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { Phone, Users, FileText, Mail, Pencil, Trash2 } from "lucide-react";
import { Box, Button, Chip, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, IconButton, Stack, Tooltip, Typography } from "@mui/material";
import { toast } from "sonner";
import { deleteActivity } from "@/actions/crm/activities/delete-activity";
import { ActivityForm } from "./ActivityForm";
import type { ActivityWithLinks } from "@/actions/crm/activities/get-activities-by-entity";

const TYPE_ICONS = { call: Phone, meeting: Users, note: FileText, email: Mail } as const;
const TYPE_LABELS = { call: "Call", meeting: "Meeting", note: "Note", email: "Email" } as const;

interface Props {
  activity: ActivityWithLinks;
  onDeleted: (id: string) => void;
  onUpdated: (activity: ActivityWithLinks) => void;
  entityType: string;
  entityId: string;
}

export function ActivityEntry({ activity, onDeleted, onUpdated, entityType, entityId }: Props) {
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const Icon = TYPE_ICONS[activity.type];

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const result = await deleteActivity(activity.id);
      if (result.error) toast.error(result.error);
      else { toast.success("Activity deleted"); onDeleted(activity.id); setDeleteOpen(false); }
    } catch {
      toast.error("Failed to delete activity");
    } finally {
      setDeleting(false);
    }
  };

  return <>
    <Box sx={{ display: "flex", gap: 1.5, py: 1.5, borderBottom: 1, borderColor: "divider", "&:last-of-type": { borderBottom: 0 } }}>
      <Box sx={{ color: "text.secondary", pt: 0.5, flexShrink: 0 }}><Icon size={18} /></Box>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Stack direction="row" spacing={1} sx={{ alignItems: "flex-start", justifyContent: "space-between" }}>
          <Box sx={{ minWidth: 0, flex: 1 }}>
            <Typography variant="body2" sx={{ fontWeight: 600 }} noWrap>{activity.title}</Typography>
            <Stack direction="row" spacing={0.75} sx={{ mt: 0.75, flexWrap: "wrap", gap: 0.5 }}>
              <Chip size="small" variant="outlined" label={TYPE_LABELS[activity.type]} />
              <Chip size="small" color={activity.status === "completed" ? "success" : activity.status === "cancelled" ? "default" : "info"} variant="outlined" label={activity.status} />
            </Stack>
          </Box>
          <Stack direction="row" spacing={0.25} sx={{ alignItems: "center", flexShrink: 0 }}>
            <Tooltip title={new Date(activity.date).toLocaleString()}>
              <Typography variant="caption" color="text.secondary" sx={{ cursor: "default" }}>{formatDistanceToNow(new Date(activity.date), { addSuffix: true })}</Typography>
            </Tooltip>
            <IconButton size="small" aria-label="Edit activity" onClick={() => setEditOpen(true)}><Pencil size={16} /></IconButton>
            <IconButton size="small" aria-label="Delete activity" onClick={() => setDeleteOpen(true)} disabled={deleting}><Trash2 size={16} /></IconButton>
          </Stack>
        </Stack>
        {activity.description && <Typography variant="body2" color="text.secondary" sx={{ mt: 0.75, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{activity.description}</Typography>}
        {activity.outcome && <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 0.75 }}><Box component="span" sx={{ fontWeight: 600 }}>Outcome:</Box> {activity.outcome}</Typography>}
      </Box>
    </Box>
    <Dialog open={deleteOpen} onClose={() => !deleting && setDeleteOpen(false)} fullWidth maxWidth="xs">
      <DialogTitle>Delete activity?</DialogTitle>
      <DialogContent><DialogContentText>This will permanently delete “{activity.title}”. This action cannot be undone.</DialogContentText></DialogContent>
      <DialogActions><Button onClick={() => setDeleteOpen(false)} disabled={deleting}>Cancel</Button><Button color="error" variant="contained" onClick={handleDelete} disabled={deleting}>{deleting ? "Deleting..." : "Delete"}</Button></DialogActions>
    </Dialog>
    <ActivityForm open={editOpen} onOpenChange={setEditOpen} entityType={entityType} entityId={entityId} activity={activity} onSaved={onUpdated} />
  </>;
}
