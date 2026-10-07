"use client";

import { useState } from "react";
import Link from "next/link";
import moment from "moment";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Box, Button, Chip, Drawer, Paper, Stack, Typography } from "@mui/material";
import { CheckSquare, Eye, MessagesSquare, Pencil } from "lucide-react";
import { Sections } from "@prisma/client";
import { getTaskDone } from "../../actions/get-task-done";
import { TeamConversations } from "../../tasks/viewtask/[taskId]/components/team-conversation";
import MuiUpdateTaskForm from "@/app/[locale]/(routes)/projects/forms/MuiUpdateTask";

interface DashboardData { getTaskPastDue: Tasks[]; getTaskPastDueInSevenDays: Tasks[] }
export interface Tasks { id: string; title: string; content: string; dueDateAt: Date; priority: string; section: string; comments: Comment[] }
export interface Comment { id: string; content: string; createdAt: Date; updatedAt: Date }

function DashboardTaskCard({ task, boards, sections }: { task: Tasks; boards: any; sections: Sections[] }) {
  const router = useRouter();
  const [chatOpen, setChatOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  async function markDone() {
    setLoading(true);
    try { await getTaskDone(task.id); toast.success("Success"); }
    catch { toast.error("Error"); }
    finally { setLoading(false); router.refresh(); }
  }
  return <Paper variant="outlined" sx={{ p: 2 }}><Stack spacing={1}><Typography variant="h6">{task.title || "Untitled"}</Typography><Typography variant="body2" color="text.secondary">{task.content}</Typography><Typography variant="body2" color={new Date(task.dueDateAt) < new Date() ? "error" : "text.secondary"}>Due date: {moment(task.dueDateAt).format("YYYY-MM-DD")}</Typography><Chip size="small" variant="outlined" color={task.priority === "high" || task.priority === "critical" ? "error" : "default"} label={`Priority: ${task.priority}`} sx={{ alignSelf: "flex-start" }} /><Stack direction="row" spacing={1} sx={{ flexWrap: "wrap", gap: 1 }}><Button component={Link} href={`/projects/tasks/viewtask/${task.id}`} size="small" variant="outlined" startIcon={<Eye size={16} />}>View task</Button><Button size="small" variant="outlined" startIcon={<MessagesSquare size={16} />} onClick={() => setChatOpen(true)}>Chat</Button><Button size="small" variant="outlined" startIcon={<CheckSquare size={16} />} onClick={markDone} disabled={loading}>Mark as done</Button><Button size="small" variant="outlined" startIcon={<Pencil size={16} />} onClick={() => setEditOpen(true)}>Edit</Button></Stack></Stack><Drawer anchor="right" open={chatOpen} onClose={() => setChatOpen(false)}><Box sx={{ width: { xs: "100vw", sm: 600 }, maxWidth: "100vw", p: 3 }}><Typography variant="h6">Team conversation</Typography><Typography color="text.secondary" sx={{ mb: 2 }}>Collaborate with your team on this task</Typography><TeamConversations taskId={task.id} data={task.comments} /></Box></Drawer><Drawer anchor="right" open={editOpen} onClose={() => setEditOpen(false)}><Box sx={{ width: { xs: "100vw", sm: 600 }, maxWidth: "100vw", p: 3 }}><Typography variant="h6">Update task</Typography><Typography color="text.secondary" sx={{ mb: 2 }}>Edit task details including title, description, due date, and priority</Typography><MuiUpdateTaskForm boards={boards} boardId={sections.find((section) => section.id === task.section)?.board} initialData={task} onDone={() => setEditOpen(false)} /></Box></Drawer></Paper>;
}

export default function ProjectDashboardCockpit({ dashboardData, boards, sections }: { dashboardData: DashboardData; boards: any; sections: Sections[] }) {
  return <Stack direction={{ xs: "column", md: "row" }} spacing={3} sx={{ alignItems: "flex-start" }}><Box sx={{ width: { xs: "100%", md: "50%" } }}><Typography variant="h6" sx={{ mb: 2 }}>Tasks due Today ({dashboardData?.getTaskPastDue?.length})</Typography><Stack spacing={2}>{dashboardData?.getTaskPastDue?.map((task) => <DashboardTaskCard key={task.id} task={task} boards={boards} sections={sections} />)}</Stack></Box><Box sx={{ width: { xs: "100%", md: "50%" } }}><Typography variant="h6" sx={{ mb: 2 }}>Tasks due in 7 days ({dashboardData?.getTaskPastDueInSevenDays?.length})</Typography><Stack spacing={2}>{dashboardData?.getTaskPastDueInSevenDays?.map((task) => <DashboardTaskCard key={task.id} task={task} boards={boards} sections={sections} />)}</Stack></Box></Stack>;
}
