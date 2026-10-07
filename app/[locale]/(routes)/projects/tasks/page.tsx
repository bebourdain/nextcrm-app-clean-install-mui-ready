import React from "react";
import { Box } from "@mui/material";
import { MuiPageHeader } from "@/components/mui/MuiPageHeader";
import { getTasks } from "@/actions/projects/get-tasks";
import { getBoards } from "@/actions/projects/get-boards";
import { getSession } from "@/lib/auth-server";
import { redirect } from "next/navigation";
import NewTaskDialog from "../dialogs/NewTask";
import { TasksDataTable } from "./components/data-table";
import { columns } from "./components/columns";


import { getTranslations } from "next-intl/server";

const TasksPage = async () => {
  const session = await getSession();
  if (!session) redirect("/sign-in");
  const [tasks, boards] = await Promise.all([getTasks(), getBoards(session?.user.id!)]);
  const t = await getTranslations("ProjectsPage");

  return (
    <Box sx={{ px: { xs: 2, md: 3 }, py: 3 }}>
      <MuiPageHeader title={t("tasks.title")} description={t("tasks.description")} />
      <Box sx={{ my: 2 }}><NewTaskDialog boards={boards} /></Box>
      <TasksDataTable data={tasks as any} columns={columns} />
    </Box>
  );
};

export default TasksPage;
