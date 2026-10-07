import { getBoard } from "@/actions/projects/get-board";
import React, { Suspense } from "react";

import { Box, Chip, Stack } from "@mui/material";
import { MuiPageHeader } from "@/components/mui/MuiPageHeader";
import NewSectionDialog from "./dialogs/NewSection";

import NewTaskInProjectDialog from "./dialogs/NewTaskInProject";
import { getBoardSections } from "@/actions/projects/get-board-sections";
import DeleteProjectDialog from "./dialogs/DeleteProject";
import { getKanbanData } from "@/actions/projects/get-kanban-data";
import Kanban from "./components/Kanban";
import { getBoards } from "@/actions/projects/get-boards";
import { getSession } from "@/lib/auth-server";


interface BoardDetailProps {
  params: Promise<{ boardId: string }>;
}

export const maxDuration = 300;

const BoardPage = async (props: BoardDetailProps) => {
  const params = await props.params;
  const session = await getSession();
  const user = session?.user;
  const { boardId } = params;
  const board: any = await getBoard(boardId);
  const boards = await getBoards(user?.id!);
  const sections: any = await getBoardSections(boardId);
  const kanbanData = await getKanbanData(boardId);

  //console.log(board, "board");
  return (
    <Box sx={{ px: { xs: 2, md: 3 }, py: 3 }}>
      <MuiPageHeader title={board?.board?.title ?? "Project"} description={board?.board?.description ?? ""} />
      <Stack direction="row" spacing={1} sx={{ my: 2, alignItems: "center", flexWrap: "wrap", gap: 1 }}>
        <Chip size="small" variant="outlined" label={board?.board?.visibility ?? "private"} />
        <NewSectionDialog boardId={boardId} />
        <NewTaskInProjectDialog boardId={boardId} sections={sections} />
        <Box sx={{ flexGrow: 1 }} />
        <DeleteProjectDialog boardId={boardId} boardName={board.board.title} />
      </Stack>
      <Kanban
        data={kanbanData.sections}
        boardId={boardId}
        boards={boards}
      />
    </Box>
  );
};

export default BoardPage;
