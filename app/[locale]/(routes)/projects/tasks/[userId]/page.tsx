import { getUserTasks } from "@/actions/projects/get-user-tasks";
import { Box } from "@mui/material";
import { MuiPageHeader } from "@/components/mui/MuiPageHeader";
import React from "react";
import { TasksDataTable } from "../components/data-table";
import { columns } from "../components/columns";
import { getSession } from "@/lib/auth-server";

type TaskDetailPageProps = {
  params: Promise<{
    userId: string;
    username: string;
  }>;
};

const TaskDetailPage = async (props: TaskDetailPageProps) => {
  const params = await props.params;
  const session = await getSession();
  const { userId } = params;

  const tasks: any = await getUserTasks(userId);

  return (
    <Box sx={{ px: { xs: 2, md: 3 }, py: 3 }}>
      <MuiPageHeader title={`${session?.user.name}'s Tasks`} description="Everything you need to know about tasks" />
      <TasksDataTable data={tasks} columns={columns} />
    </Box>
  );
};

export default TaskDetailPage;
