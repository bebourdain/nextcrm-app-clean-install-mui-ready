import React from "react";
import { getSession } from "@/lib/auth-server";
import { MuiLinkButton } from "@/components/mui/MuiLinkButton";

import { getBoards } from "@/actions/projects/get-boards";

import NewTaskDialog from "../dialogs/NewTask";
import NewProjectDialog from "../dialogs/NewProject";

import { Stack, Typography } from "@mui/material";

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
        <MuiLinkButton href="/projects/tasks" variant="outlined">{t("allTasks")}</MuiLinkButton>
        <MuiLinkButton href={`/projects/tasks/${userId}`} variant="outlined">{t("myTasks")}</MuiLinkButton>
        <MuiLinkButton href="/projects/dashboard" variant="outlined">{t("dashboard")}</MuiLinkButton>
      </Stack>
      <Stack spacing={2}>
        <Typography variant="h6">{t("projects")}</Typography>
        <ProjectsDataTable data={boards} columns={columns} />
      </Stack>
    </>
  );
};

export default ProjectsView;
