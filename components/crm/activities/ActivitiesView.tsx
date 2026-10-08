"use client";

import { useState, useTransition } from "react";
import { Plus } from "lucide-react";
import { Box, Button, Divider, Paper, Stack, Typography } from "@mui/material";
import { ActivityEntry } from "./ActivityEntry";
import { ActivityForm } from "./ActivityForm";
import { getActivitiesByEntity } from "@/actions/crm/activities/get-activities-by-entity";
import type { ActivityWithLinks, ActivityCursor } from "@/actions/crm/activities/get-activities-by-entity";

interface Props {
  entityType: string;
  entityId: string;
  initialData: { data: ActivityWithLinks[]; nextCursor: ActivityCursor | null };
}

export function ActivitiesView({ entityType, entityId, initialData }: Props) {
  const [activities, setActivities] = useState<ActivityWithLinks[]>(initialData.data);
  const [cursor, setCursor] = useState<ActivityCursor | null>(initialData.nextCursor);
  const [createOpen, setCreateOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const loadMore = () => {
    if (!cursor) return;
    startTransition(async () => {
      const result = await getActivitiesByEntity(entityType, entityId, cursor);
      setActivities((prev) => [...prev, ...result.data]);
      setCursor(result.nextCursor);
    });
  };

  return <Paper variant="outlined" sx={{ overflow: "hidden" }}>
    <Stack direction="row" sx={{ p: 2, alignItems: "center", justifyContent: "space-between", gap: 1 }}>
      <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>Activities</Typography>
      <Button size="small" variant="outlined" startIcon={<Plus size={16} />} onClick={() => setCreateOpen(true)}>Log activity</Button>
    </Stack>
    <Divider />
    <Box sx={{ px: 2, pb: 1 }}>
      {activities.length === 0 ? <Typography variant="body2" color="text.secondary" align="center" sx={{ py: 3 }}>No activities yet. Log a call, meeting, or note.</Typography> : <>
        {activities.map((activity) => <ActivityEntry key={activity.id} activity={activity} entityType={entityType} entityId={entityId} onDeleted={(id) => setActivities((prev) => prev.filter((item) => item.id !== id))} onUpdated={(updated) => setActivities((prev) => prev.map((item) => item.id === updated.id ? updated : item))} />)}
        {cursor && <Box sx={{ textAlign: "center", pt: 1.5 }}><Button size="small" onClick={loadMore} disabled={isPending}>{isPending ? "Loading..." : "Load more"}</Button></Box>}
      </>}
    </Box>
    <ActivityForm open={createOpen} onOpenChange={setCreateOpen} entityType={entityType} entityId={entityId} onSaved={(activity) => setActivities((prev) => [activity, ...prev])} />
  </Paper>;
}
