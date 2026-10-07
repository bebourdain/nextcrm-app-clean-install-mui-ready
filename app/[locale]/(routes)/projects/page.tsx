import React, { Suspense } from "react";
import { Box } from "@mui/material";
import { MuiPageHeader } from "@/components/mui/MuiPageHeader";

import { getSession } from "@/lib/auth-server";
import { redirect } from "next/navigation";

import ProjectsView from "./_components/ProjectsView";
import ProjectsSkeleton from "@/components/skeletons/projects-skeleton";
import { getTranslations } from "next-intl/server";

export const maxDuration = 300;

const ProjectsPage = async () => {
  const session = await getSession();
  const t = await getTranslations("ProjectsPage");

  if (!session) return redirect("/sign-in");

  return (
    <Box sx={{ px: { xs: 2, md: 3 }, py: 3 }}>
      <MuiPageHeader title={t("title")} description={t("description")} />
      <Suspense fallback={<ProjectsSkeleton />}>
        <ProjectsView />
      </Suspense>
    </Box>
  );
};

export default ProjectsPage;
