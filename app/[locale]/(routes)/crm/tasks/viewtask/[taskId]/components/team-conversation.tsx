"use client";

import { Avatar, Box, Button, Card, CardContent, Divider, Stack, TextField, Typography } from "@mui/material";
import { toast } from "sonner";
import { zodResolver } from "@hookform/resolvers/zod";
import moment from "moment";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { addComment } from "@/actions/crm/tasks/add-comment";

interface TeamConversationsProps {
  data: Array<{
    id: string;
    comment: string;
    createdAt: Date | string;
    assigned_user: { id?: string; name: string | null; avatar: string | null } | null;
  }>;
  taskId: string;
}

const FormSchema = z.object({ comment: z.string().min(3).max(160) });

export function TeamConversations({ data: comments, taskId }: TeamConversationsProps) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const form = useForm<z.infer<typeof FormSchema>>({ resolver: zodResolver(FormSchema), defaultValues: { comment: "" } });
  async function onSubmit(data: z.infer<typeof FormSchema>) {
    try {
      setIsLoading(true);
      const result = await addComment({ taskId, comment: data.comment });
      if (result?.error) toast.error(result.error);
      else toast.success("Success");
    } catch {
      toast.error("Something went wrong while sending comment to the DB");
    } finally {
      form.reset({ comment: "" });
      router.refresh();
      setIsLoading(false);
    }
  }
  return <Box sx={{ display: "grid", gap: 2 }}>
    <Box component="form" onSubmit={form.handleSubmit(onSubmit)} sx={{ display: "flex", gap: 1, alignItems: "flex-start" }}>
      <TextField size="small" placeholder="Your comment ..." aria-label="Your comment" fullWidth disabled={isLoading} {...form.register("comment")} error={Boolean(form.formState.errors.comment)} helperText={form.formState.errors.comment?.message} />
      <Button variant="contained" type="submit" disabled={isLoading} sx={{ minWidth: 80, height: 40 }}>Add</Button>
    </Box>
    <Card variant="outlined">
      <CardContent><Typography variant="h6">Team conversation</Typography><Typography variant="body2" color="text.secondary">Invite your team members to collaborate.</Typography></CardContent>
      <Divider />
      <CardContent sx={{ display: "grid", gap: 2.5 }}>
        {comments.map((comment) => <Stack key={comment.id} direction="row" spacing={1.5} sx={{ alignItems: "flex-start" }}>
          <Avatar src={comment.assigned_user?.avatar || "/images/nouser.png"} alt={comment.assigned_user?.name ?? ""}>{comment.assigned_user?.name?.charAt(0)}</Avatar>
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>{comment.assigned_user?.name}</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ overflowWrap: "anywhere" }}>{comment.comment}</Typography>
            <Typography variant="caption" color="text.secondary">{moment(comment.createdAt).format("YYYY-MM-DD-HH:mm")}</Typography>
          </Box>
        </Stack>)}
      </CardContent>
    </Card>
  </Box>;
}
