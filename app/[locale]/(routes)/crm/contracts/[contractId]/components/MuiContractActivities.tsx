"use client";

import { useState, useTransition } from "react";
import { formatDistanceToNow } from "date-fns";
import { FileText, Mail, Pencil, Phone, Plus, Trash2, Users } from "lucide-react";
import { toast } from "sonner";
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Divider,
  IconButton,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import { getActivitiesByEntity } from "@/actions/crm/activities/get-activities-by-entity";
import type { ActivityCursor, ActivityWithLinks } from "@/actions/crm/activities/get-activities-by-entity";
import { deleteActivity } from "@/actions/crm/activities/delete-activity";
import { ActivityForm } from "@/components/crm/activities/ActivityForm";

interface Props {
  contractId: string;
  initialData: { data: ActivityWithLinks[]; nextCursor: ActivityCursor | null };
}

const typeIcons = { call: Phone, meeting: Users, note: FileText, email: Mail } as const;
const typeLabels = { call: "Call", meeting: "Meeting", note: "Note", email: "Email" } as const;

function ActivityRow({ activity, contractId, onDeleted, onUpdated }: {
  activity: ActivityWithLinks;
  contractId: string;
  onDeleted: (id: string) => void;
  onUpdated: (activity: ActivityWithLinks) => void;
}) {
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const Icon = typeIcons[activity.type];

  const remove = async () => {
    setDeleting(true);
    try {
      const result = await deleteActivity(activity.id);
      if (result.error) toast.error(result.error);
      else {
        toast.success("Activity deleted");
        onDeleted(activity.id);
        setDeleteOpen(false);
      }
    } catch {
      toast.error("Could not delete the activity.");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      <Stack direction="row" spacing={1.5} sx={{ py: 1.5, alignItems: "flex-start", minWidth: 0 }}>
        <Box sx={{ display: "flex", color: "text.secondary", pt: 0.5 }}><Icon size={18} /></Box>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography variant="body2" sx={{ fontWeight: 600 }}>{activity.title}</Typography>
          <Stack direction="row" spacing={0.75} sx={{ mt: 0.75, flexWrap: "wrap" }}>
            <Chip size="small" variant="outlined" label={typeLabels[activity.type]} />
            <Chip size="small" color={activity.status === "completed" ? "success" : activity.status === "cancelled" ? "default" : "info"} variant="outlined" label={activity.status} />
          </Stack>
          {activity.description && <Typography variant="body2" color="text.secondary" sx={{ mt: 0.75 }}>{activity.description}</Typography>}
          {activity.outcome && <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 0.5 }}>Outcome: {activity.outcome}</Typography>}
        </Box>
        <Stack direction="row" spacing={0.25} sx={{ alignItems: "center" }}>
          <Tooltip title={new Date(activity.date).toLocaleString()}>
            <Typography variant="caption" color="text.secondary" sx={{ whiteSpace: "nowrap" }}>{formatDistanceToNow(new Date(activity.date), { addSuffix: true })}</Typography>
          </Tooltip>
          <IconButton size="small" aria-label={`Edit ${activity.title}`} onClick={() => setEditOpen(true)}><Pencil size={16} /></IconButton>
          <IconButton size="small" aria-label={`Delete ${activity.title}`} onClick={() => setDeleteOpen(true)} disabled={deleting}><Trash2 size={16} /></IconButton>
        </Stack>
      </Stack>
      <Divider />
      <Dialog open={deleteOpen} onClose={deleting ? undefined : () => setDeleteOpen(false)}>
        <DialogTitle>Delete activity?</DialogTitle>
        <DialogContent><DialogContentText>This will permanently delete “{activity.title}”. This action cannot be undone.</DialogContentText></DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteOpen(false)} disabled={deleting}>Cancel</Button>
          <Button color="error" variant="contained" onClick={remove} disabled={deleting}>{deleting ? "Deleting..." : "Delete"}</Button>
        </DialogActions>
      </Dialog>
      <ActivityForm open={editOpen} onOpenChange={setEditOpen} entityType="contract" entityId={contractId} activity={activity} onSaved={onUpdated} />
    </>
  );
}

export function MuiContractActivities({ contractId, initialData }: Props) {
  const [activities, setActivities] = useState<ActivityWithLinks[]>(initialData.data);
  const [cursor, setCursor] = useState<ActivityCursor | null>(initialData.nextCursor);
  const [createOpen, setCreateOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const loadMore = () => {
    if (!cursor) return;
    startTransition(async () => {
      const result = await getActivitiesByEntity("contract", contractId, cursor);
      setActivities((current) => [...current, ...result.data]);
      setCursor(result.nextCursor);
    });
  };

  return (
    <Card>
      <Box sx={{ p: 3, pb: 1.5 }}>
        <Stack direction="row" sx={{ alignItems: "center", justifyContent: "space-between", gap: 2 }}>
          <Typography variant="h5" component="h2">Activities</Typography>
          <Button size="small" variant="outlined" startIcon={<Plus size={16} />} onClick={() => setCreateOpen(true)}>Log activity</Button>
        </Stack>
        <Divider sx={{ mt: 2.5 }} />
      </Box>
      <CardContent sx={{ pt: 1.5 }}>
        {activities.length === 0
          ? <Typography variant="body2" color="text.secondary" sx={{ py: 2, textAlign: "center" }}>No activities yet. Log a call, meeting, or note.</Typography>
          : activities.map((activity) => (
            <ActivityRow
              key={activity.id}
              activity={activity}
              contractId={contractId}
              onDeleted={(id) => setActivities((current) => current.filter((entry) => entry.id !== id))}
              onUpdated={(updated) => setActivities((current) => current.map((entry) => entry.id === updated.id ? updated : entry))}
            />
          ))}
        {cursor && <Button variant="text" size="small" onClick={loadMore} disabled={isPending} sx={{ mt: 1, display: "block", mx: "auto" }}>{isPending ? "Loading..." : "Load more"}</Button>}
      </CardContent>
      <ActivityForm
        open={createOpen}
        onOpenChange={setCreateOpen}
        entityType="contract"
        entityId={contractId}
        onSaved={(activity) => setActivities((current) => [activity, ...current])}
      />
    </Card>
  );
}
