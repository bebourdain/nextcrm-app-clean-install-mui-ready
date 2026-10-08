import moment from "moment";
import { Box, Chip, Divider, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from "@mui/material";
import { MuiPageHeader } from "@/components/mui/MuiPageHeader";
import { getDocuments } from "@/actions/documents/get-documents";
import { extractDocuments } from "@/lib/junction-helpers";
import { TeamConversations } from "./components/team-conversation";
import { TaskDataTable } from "./components/data-table";
import { columns } from "./components/columns";
import { columnsTask } from "./components/columns-task";
import { getCrMTask } from "@/actions/crm/account/get-task";

type TaskPageProps = { params: Promise<{ taskId: string }> };

export default async function CRMTaskPage({ params }: TaskPageProps) {
  const { taskId } = await params;
  const task: any = await getCrMTask(taskId);
  const taskDocuments = extractDocuments(task?.documents ?? []);
  const documents: any = await getDocuments();
  const comments = task?.comments ?? [];
  const details = [
    ["ID", task.id],
    ["Date created", moment(task.createdAt).format("YYYY-MM-DD")],
    ["Date due", moment(task.dueDateAt).format("YYYY-MM-DD")],
    ["Date modified", moment(task.lastEditedAt).format("YYYY-MM-DD")],
    ["Priority", <Chip key="priority" size="small" label={task.priority} color={task.priority === "high" ? "error" : "default"} variant={task.priority === "high" ? "filled" : "outlined"} />],
    ["Title", task.title],
    ["Content", task.content],
    ["Assigned to", task.assigned_user?.name || "Not assigned"],
  ];
  return <Box sx={{ width: "100%", pb: 6 }}>
    <MuiPageHeader title="Task details" description={task.title} />
    <Divider sx={{ my: 2 }} />
    <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "minmax(0, 2fr) minmax(300px, 1fr)" }, gap: 3 }}>
      <Box sx={{ minWidth: 0 }}>
        <Paper variant="outlined" sx={{ overflow: "hidden", borderRadius: "var(--radius)" }}>
          <TableContainer><Table size="small"><TableHead><TableRow><TableCell>Property</TableCell><TableCell>Value</TableCell></TableRow></TableHead>
            <TableBody>{details.map(([label, value]) => <TableRow key={String(label)}><TableCell sx={{ width: 170, color: "text.secondary" }}>{label}</TableCell><TableCell sx={{ overflowWrap: "anywhere" }}>{value}</TableCell></TableRow>)}</TableBody>
          </Table></TableContainer>
        </Paper>
        <Typography variant="h6" component="h2" sx={{ mt: 3, mb: 1.5 }}>Task documents ({taskDocuments.length})</Typography>
        <TaskDataTable data={taskDocuments} columns={columnsTask} />
        <Divider sx={{ my: 3 }} />
        <Typography variant="h6" component="h2" sx={{ mb: 1.5 }}>Available documents ({documents.length})</Typography>
        <TaskDataTable data={documents} columns={columns} />
      </Box>
      <Box sx={{ minWidth: 0 }}><TeamConversations data={comments} taskId={task.id} /></Box>
    </Box>
  </Box>;
}
