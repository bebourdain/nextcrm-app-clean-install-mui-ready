"use client";

import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import moment from "moment";
import { Avatar, Box, Button, Divider, Paper, Stack, TextField, Typography } from "@mui/material";
import { addCommentToTask } from "@/actions/projects/add-comment-to-task";
import { Comment } from "@/app/[locale]/(routes)/projects/dashboard/components/ProjectDasboard";

const schema = z.object({ comment: z.string().min(3).max(160) });
type Values = z.infer<typeof schema>;
export function TeamConversations({ data: comments, taskId }: { data: Comment[]; taskId: string }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { control, handleSubmit, reset, formState: { errors } } = useForm<Values>({ resolver: zodResolver(schema), defaultValues: { comment: "" } });
  async function submit(data: Values) {
    setLoading(true);
    try { const result = await addCommentToTask({ taskId, comment: data.comment }); if (result?.error) toast.error(result.error); else toast.success("Success"); }
    catch { toast.error("Something went wrong while sending comment to the DB"); }
    finally { reset(); router.refresh(); setLoading(false); }
  }
  return <Stack spacing={2}><Stack component="form" direction="row" spacing={1} onSubmit={handleSubmit(submit)} sx={{ alignItems: "flex-start" }}><Controller name="comment" control={control} render={({ field }) => <TextField {...field} size="small" fullWidth placeholder="Your comment ..." error={!!errors.comment} helperText={errors.comment?.message} disabled={loading} />} /><Button type="submit" variant="contained" disabled={loading}>{loading ? "Adding…" : "Add"}</Button></Stack><Paper variant="outlined" sx={{ p: 2 }}><Typography variant="h6">Team conversation</Typography><Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>Invite your team members to collaborate.</Typography><Stack spacing={2}>{comments?.map((comment: any) => <Box key={comment.id}><Stack direction="row" spacing={1.5} sx={{ alignItems: "flex-start" }}><Avatar src={comment.assigned_user?.avatar || "/images/nouser.png"}>{comment.assigned_user?.name?.[0]}</Avatar><Box><Typography variant="body2" sx={{ fontWeight: 600 }}>{comment.assigned_user?.name}</Typography><Typography variant="body2">{comment.comment}</Typography><Typography variant="caption" color="text.secondary">{moment(comment.createdAt).format("YYYY-MM-DD HH:mm")}</Typography></Box></Stack><Divider sx={{ mt: 1.5 }} /></Box>)}</Stack></Paper></Stack>;
}
