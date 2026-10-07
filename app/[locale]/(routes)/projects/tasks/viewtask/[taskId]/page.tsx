import { getTask } from "@/actions/projects/get-task";
import React from "react";
import moment from "moment";

import { getDocuments } from "@/actions/documents/get-documents";
import { getTaskComments } from "@/actions/projects/get-task-comments";
import { getTaskDocuments } from "@/actions/projects/get-task-documents";

import { Box, Chip, Divider, Paper, Stack, Typography } from "@mui/material";
import { MuiPageHeader } from "@/components/mui/MuiPageHeader";

import { TeamConversations } from "./components/team-conversation";
import { TaskDataTable } from "./components/data-table";
import { columns } from "./components/columns";
import { columnsTask } from "./components/columns-task";

import TaskViewActions from "./components/TaskViewActions";
import { prismadb } from "@/lib/prisma";
import { getBoards } from "@/actions/projects/get-boards";
import { getSession } from "@/lib/auth-server";

type TaskPageProps = {
  params: Promise<{
    taskId: string;
  }>;
};

const TaskPage = async (props: TaskPageProps) => {
  const params = await props.params;
  const session = await getSession();
  const user = session?.user;

  const { taskId } = params;
  const task: any = await getTask(taskId);
  const [taskDocuments, documents, comments, boards] = await Promise.all([
    getTaskDocuments(taskId),
    getDocuments(),
    getTaskComments(taskId),
    getBoards(user?.id!),
  ]);
  const creatorUser = task?.createdBy
    ? await prismadb.users.findFirst({
        where: { id: task.createdBy },
        select: { name: true },
      })
    : null;

  const facts = [
    ["Date created", moment(task.createdAt).format("YYYY-MM-DD HH:mm:ss")],
    ["Date due", moment(task.dueDateAt).format("YYYY-MM-DD HH:mm")],
    ["Last modified", moment(task.lastEditedAt).format("YYYY-MM-DD HH:mm:ss")],
    ["Assigned to", task.assigned_user?.name || "Not assigned"],
    ["Created by", creatorUser?.name || "Unknown"],
  ];
  return <Box sx={{ px: { xs: 2, md: 3 }, py: 3 }}><MuiPageHeader title={task.title} description={task.content ?? ""} /><Stack direction={{ xs: "column", md: "row" }} spacing={3} sx={{ alignItems: "flex-start" }}><Box sx={{ width: { xs: "100%", md: "66.67%" } }}><Paper variant="outlined" sx={{ p: 3, mb: 3 }}><Stack spacing={2}><Typography variant="h6">Task details</Typography>{facts.map(([label, value]) => <Stack key={label} direction="row" spacing={2} sx={{ justifyContent: "space-between", borderBottom: 1, borderColor: "divider", pb: 1 }}><Typography color="text.secondary">{label}</Typography><Typography>{value}</Typography></Stack>)}<Stack direction="row" spacing={1}><Chip label={`Priority: ${task.priority}`} color={task.priority === "high" ? "error" : "default"} variant="outlined" /><Chip label={`Status: ${task.taskStatus}`} color={task.taskStatus === "COMPLETE" ? "success" : "default"} variant="outlined" /></Stack><TaskViewActions taskId={taskId} boards={boards} initialData={task} /></Stack></Paper><Typography variant="h6" sx={{ mb: 2 }}>Task documents ({taskDocuments.length})</Typography><TaskDataTable data={taskDocuments} columns={columnsTask} /><Divider sx={{ my: 3 }} /><Typography variant="h6" sx={{ mb: 2 }}>Available documents ({documents.length})</Typography><TaskDataTable data={documents} columns={columns} /></Box><Box sx={{ width: { xs: "100%", md: "33.33%" } }}><TeamConversations data={comments as any} taskId={task.id} /></Box></Stack></Box>;
};

export default TaskPage;
