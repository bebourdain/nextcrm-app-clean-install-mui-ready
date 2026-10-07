import React from "react";
import Link from "next/link";
import { getSession } from "@/lib/auth-server";

import { getBoards } from "@/actions/projects/get-boards";

import NewTaskDialog from "../dialogs/NewTask";
import NewProjectDialog from "../dialogs/NewProject";

import { Button, Stack, Typography } from "@mui/material";

import { ProjectsDataTable } from "../table-components/data-table";
import { columns } from "../table-components/columns";
import { getTranslations } from "next-intl/server";

const ProjectsView = async () => {
  const session = await getSession();
  const t = await getTranslations("ProjectsPage");

  if (!session) return null;

  const userId = session.user.id;

  const boards: any = await getBoards(userId!);

  return (
    <>
      <Stack direction="row" spacing={1} sx={{ py: 3, flexWrap: "wrap", gap: 1 }}>
        <NewProjectDialog />
        <NewTaskDialog boards={boards} />
        <Button component={Link} href="/projects/tasks" variant="outlined">{t("allTasks")}</Button>
        <Button component={Link} href={`/projects/tasks/${userId}`} variant="outlined">{t("myTasks")}</Button>
        <Button component={Link} href="/projects/dashboard" variant="outlined">{t("dashboard")}</Button>
      </Stack>
      <Stack spacing={2}>
        <Typography variant="h6">{t("projects")}</Typography>
        <ProjectsDataTable data={boards} columns={columns} />
      </Stack>
    </>
  );
};

export default ProjectsView;
