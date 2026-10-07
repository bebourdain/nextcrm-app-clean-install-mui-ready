"use client";

import moment from "moment";
import { useRouter } from "next/navigation";
import React, { ChangeEvent, useEffect, useRef, useState } from "react";

import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  useDroppable,
  DragStartEvent,
  DragEndEvent,
  DragOverEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

import { Box, Button, Chip, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Drawer, IconButton, Menu, MenuItem, Paper, Skeleton, Stack, TextField, Tooltip, Typography } from "@mui/material";
import { MoreHorizontal, Plus, Trash2, AlertTriangle, Check } from "lucide-react";
import { toast } from "sonner";

import NewSectionForm from "../forms/NewSection";
import UpdateTaskDialog from "../../../dialogs/UpdateTask";
import { markTaskDone } from "@/actions/projects/mark-task-done";
import { deleteSection } from "@/actions/projects/delete-section";
import { updateSectionTitle } from "@/actions/projects/update-section-title";
import { createTaskInBoard } from "@/actions/projects/create-task-in-board";
import { deleteTask } from "@/actions/projects/delete-task";
import { updateKanbanPosition } from "@/actions/projects/update-kanban-position";

let timer: any;
const timeout = 1000;

interface Task {
  id: string;
  section: string;
  title?: string;
  content?: string;
  dueDateAt?: Date;
  priority?: string;
  taskStatus?: string;
}

function TaskItem({ task, onDelete, onDone, onEdit, router }: any) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: task.id });
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 };
  return <Paper ref={setNodeRef} style={style} {...attributes} {...listeners} variant="outlined" sx={{ p: 1.5, mb: 1, cursor: "grab", bgcolor: "background.paper" }}><Stack spacing={1}><Stack direction="row" sx={{ alignItems: "flex-start" }}><Typography variant="subtitle2" sx={{ flexGrow: 1 }}>{task.title || "Untitled"}</Typography>{task.dueDateAt && task.taskStatus !== "COMPLETE" && new Date(task.dueDateAt) < new Date() && <Tooltip title="Attention! This task is overdue!"><AlertTriangle size={16} color="red" /></Tooltip>}{task.taskStatus === "COMPLETE" && <Tooltip title="This task is done!"><Check size={16} color="green" /></Tooltip>}<IconButton size="small" aria-label="Task actions" onClick={(event) => setAnchor(event.currentTarget)}><MoreHorizontal size={18} /></IconButton><Menu anchorEl={anchor} open={!!anchor} onClose={() => setAnchor(null)}><MenuItem onClick={() => { setAnchor(null); router.push(`/projects/tasks/viewtask/${task.id}`); }}>View</MenuItem>{task.taskStatus !== "COMPLETE" && <MenuItem onClick={() => { setAnchor(null); onEdit(task); }}>Edit</MenuItem>}{task.taskStatus !== "COMPLETE" && <MenuItem onClick={() => { setAnchor(null); onDone(task.id); }}>Mark as done</MenuItem>}<MenuItem onClick={() => { setAnchor(null); onDelete(task); }} sx={{ color: "error.main" }}>Delete</MenuItem></Menu></Stack><Typography variant="caption" color="text.secondary">Due date: {moment(task.dueDateAt).format("YYYY-MM-DD")}</Typography><Chip size="small" variant="outlined" color={task.priority === "high" || task.priority === "critical" ? "error" : "default"} label={`Priority: ${task.priority ?? "None"}`} sx={{ alignSelf: "flex-start" }} /><Tooltip title={task.content ?? ""}><Typography variant="body2" color="text.secondary" noWrap>{task.content}</Typography></Tooltip></Stack></Paper>;
}

function DroppableColumn({ id, children }: { id: string; children: React.ReactNode }) {
  const { setNodeRef } = useDroppable({ id });
  return (
    <Box ref={setNodeRef} sx={{ minHeight: 50 }}>{children}</Box>
  );
}

const Kanban = (props: any) => {
  const boardId = props.boardId;
  const boards = props.boards;

  const serverDataRef = useRef(props.data);
  const [data, setData]: any = useState(() =>
    structuredClone(props.data || [])
  );
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const dataRef = useRef<any[]>(data);
  dataRef.current = data;
  const origSectionIdRef = useRef<string | null>(null); // section at drag start
  const isDraggingRef = useRef(false);

  // Sync from server after router.refresh() — only when not dragging
  useEffect(() => {
    if (serverDataRef.current !== props.data && !isDraggingRef.current) {
      serverDataRef.current = props.data;
      setData(structuredClone(props.data || []));
    }
  }, [props.data]);

  const setDataAndRef = (newData: any[]) => {
    dataRef.current = newData;
    setData(newData);
  };

  const [sectionId, setSectionId] = useState(null);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  const [open, setOpen] = useState(false);
  const [openSectionAlert, setOpenSectionAlert] = useState(false);
  const [sectionOpenDialog, setSectionOpenDialog] = useState(false);
  const [updateOpenSheet, setUpdateOpenSheet] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingSection, setIsLoadingSection] = useState(false);

  const router = useRouter();

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    isDraggingRef.current = true;
    const { active } = event;
    const activeId = active.id as string;
    for (const section of dataRef.current) {
      const task = section.tasks.find((t: Task) => t.id === activeId);
      if (task) {
        setActiveTask(task);
        origSectionIdRef.current = section.id; // record where drag started
        break;
      }
    }
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;
    const activeId = active.id as string;
    const overId = over.id as string;
    if (activeId === overId) return;

    const current = dataRef.current;

    // Find source section and task index
    let fromSectionIdx = -1, fromTaskIdx = -1;
    for (let i = 0; i < current.length; i++) {
      const idx = current[i].tasks.findIndex((t: Task) => t.id === activeId);
      if (idx !== -1) { fromSectionIdx = i; fromTaskIdx = idx; break; }
    }
    if (fromSectionIdx === -1) return;

    // Determine destination — overId could be a section ID or a task ID
    let toSectionIdx = current.findIndex((s: any) => s.id === overId);
    let toTaskIdx = 0;
    const isOverSection = toSectionIdx !== -1;

    if (!isOverSection) {
      // overId is a task — find which section it belongs to
      for (let i = 0; i < current.length; i++) {
        const idx = current[i].tasks.findIndex((t: Task) => t.id === overId);
        if (idx !== -1) { toSectionIdx = i; toTaskIdx = idx; break; }
      }
    } else {
      // Dropping directly onto section — insert at end
      toTaskIdx = current[toSectionIdx].tasks.length;
    }

    if (toSectionIdx === -1) return;
    if (fromSectionIdx === toSectionIdx) return; // same section — SortableContext handles it

    const newData = current.map((s: any) => ({ ...s, tasks: [...s.tasks] }));
    const [movedTask] = newData[fromSectionIdx].tasks.splice(fromTaskIdx, 1);
    movedTask.section = newData[toSectionIdx].id;
    newData[toSectionIdx].tasks.splice(toTaskIdx, 0, movedTask);
    setDataAndRef(newData);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    isDraggingRef.current = false;
    const { active, over } = event;
    setActiveTask(null);
    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;
    const current = dataRef.current;

    // Find current position of the dragged task
    let curSectionIdx = -1, curTaskIdx = -1;
    for (let i = 0; i < current.length; i++) {
      const idx = current[i].tasks.findIndex((t: Task) => t.id === activeId);
      if (idx !== -1) { curSectionIdx = i; curTaskIdx = idx; break; }
    }
    if (curSectionIdx === -1) return;

    const curSectionId = current[curSectionIdx].id;
    const wasCrossSectionMove = origSectionIdRef.current !== null &&
      origSectionIdRef.current !== curSectionId;

    if (wasCrossSectionMove) {
      // handleDragOver already updated local state — just persist with original source section
      const newData = current.map((s: any) => ({ ...s, tasks: [...s.tasks] }));
      const origSectionIdx = newData.findIndex((s: any) => s.id === origSectionIdRef.current);
      const origSection = origSectionIdx !== -1 ? newData[origSectionIdx] : newData[curSectionIdx];
      const destSection = newData[curSectionIdx];
      try {
        await updateKanbanPosition({
          resourceList: origSection.tasks,
          destinationList: destSection.tasks,
          resourceSectionId: origSection.id,
          destinationSectionId: destSection.id,
        });
      } catch (err) {
        toast.error("Failed to update task position");
        setData(props.data);
      }
      return;
    }

    // Same-section reorder — find target task index and use arrayMove
    let overTaskIdx = current[curSectionIdx].tasks.findIndex((t: Task) => t.id === overId);
    if (overTaskIdx === -1) return; // dropped on same task or no move

    const newData = current.map((s: any) => ({ ...s, tasks: [...s.tasks] }));
    newData[curSectionIdx].tasks = arrayMove(newData[curSectionIdx].tasks, curTaskIdx, overTaskIdx);
    setDataAndRef(newData);

    try {
      await updateKanbanPosition({
        resourceList: newData[curSectionIdx].tasks,
        destinationList: newData[curSectionIdx].tasks,
        resourceSectionId: curSectionId,
        destinationSectionId: curSectionId,
      });
    } catch (err) {
      toast.error("Failed to update task position");
      setData(props.data);
    }
  };

  const onDeleteSection = async () => {
    setIsLoadingSection(true);
    try {
      const result = await deleteSection(sectionId as unknown as string);
      if (result?.error) {
        toast.error(result.error);
      } else {
        const newData = [...data].filter((e) => e.id !== sectionId);
        setData(newData);
        toast.success("Section deleted successfully");
      }
    } catch (err) {
      toast.error("Something went wrong, during deleting section");
    } finally {
      setIsLoadingSection(false);
      setSectionId(null);
      setOpenSectionAlert(false);
      router.refresh();
    }
  };

  const updateSectionTitleHandler = async (
    e: ChangeEvent<HTMLInputElement>,
    sectionId: string
  ) => {
    clearTimeout(timer);
    const newTitle = e.target.value;
    const newData = [...data];
    const index = newData.findIndex((e) => e.id === sectionId);
    newData[index].title = newTitle;
    setData(newData);
    timer = setTimeout(async () => {
      try {
        const result = await updateSectionTitle({ sectionId, newTitle });
        if (result?.success) {
          toast.success("New section title saved in database");
        }
      } catch (err) {
        alert(err);
      }
    }, timeout);
  };

  const createTask = async (sectionId: string) => {
    try {
      await createTaskInBoard({
        boardId,
        section: sectionId,
      });
      toast.success("New task saved in database");
    } catch (error) {
      console.log(error);
      toast.error("Something went wrong, during creating task");
    } finally {
      setIsLoading(false);
      router.refresh();
    }
  };

  const onDone = async (id: string) => {
    setIsLoading(true);
    try {
      await markTaskDone(id);
      toast.success("Success");
    } catch (error) {
      toast.error("Error");
    } finally {
      setIsLoading(false);
      router.refresh();
    }
  };

  const onDelete = async () => {
    setOpen(false);
    setIsLoading(true);
    if (!selectedTask || !selectedTask.id || !selectedTask.section) {
      toast.error("Invalid task. Please select a valid task to delete.");
      setIsLoading(false);
      return;
    }
    try {
      const result = await deleteTask({
        id: selectedTask.id,
        section: selectedTask.section,
      });
      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success("Task deleted successfully");
      }
    } catch (error) {
      console.log(error);
      toast.error("Something went wrong, during deleting task");
    } finally {
      setIsLoading(false);
      router.refresh();
    }
  };

  if (isLoading) return <Stack spacing={1} sx={{ py: 2 }}><Skeleton /><Skeleton /><Skeleton width="75%" /></Stack>;

  return <><Dialog open={open} onClose={() => setOpen(false)}><DialogTitle>Delete task?</DialogTitle><DialogContent><DialogContentText>This task will be deleted.</DialogContentText></DialogContent><DialogActions><Button onClick={() => setOpen(false)}>Cancel</Button><Button color="error" variant="contained" onClick={onDelete} disabled={isLoading}>Delete</Button></DialogActions></Dialog><Dialog open={openSectionAlert} onClose={() => setOpenSectionAlert(false)}><DialogTitle>Delete section?</DialogTitle><DialogContent><DialogContentText>This section will be deleted.</DialogContentText></DialogContent><DialogActions><Button onClick={() => setOpenSectionAlert(false)}>Cancel</Button><Button color="error" variant="contained" onClick={onDeleteSection} disabled={isLoadingSection}>Delete</Button></DialogActions></Dialog><Dialog open={sectionOpenDialog} onClose={() => setSectionOpenDialog(false)} fullWidth maxWidth="xs"><DialogTitle>Create new section</DialogTitle><DialogContent><Typography color="text.secondary" sx={{ mb: 2 }}>Fill out the form below to create a new section to this project.</Typography><NewSectionForm boardId={boardId} onClose={() => setSectionOpenDialog(false)} /></DialogContent></Dialog><Drawer anchor="right" open={updateOpenSheet} onClose={() => setUpdateOpenSheet(false)}><Box sx={{ width: { xs: "100vw", sm: 600 }, maxWidth: "100vw", p: 3, overflowY: "auto" }}><Typography variant="h6">Update Task</Typography><Typography color="text.secondary" sx={{ mb: 2 }}>Edit task details including title, description, due date, priority, and assignments</Typography><UpdateTaskDialog boards={boards} boardId={boardId} initialData={selectedTask} onDone={() => setUpdateOpenSheet(false)} /></Box></Drawer><Stack spacing={2}><Typography variant="body2" color="text.secondary">{data?.length} Sections</Typography><DndContext sensors={sensors} collisionDetection={closestCorners} onDragStart={handleDragStart} onDragOver={handleDragOver} onDragEnd={handleDragEnd}><Stack direction="row" spacing={2} sx={{ overflowX: "auto", alignItems: "flex-start", pb: 2 }}>{data?.map((section: any) => <Paper key={section.id} variant="outlined" sx={{ width: 320, minWidth: 320, p: 1.5, bgcolor: "background.default" }}><Stack spacing={1}><Stack direction="row" spacing={1} sx={{ alignItems: "center" }}><TextField size="small" defaultValue={section.title} onChange={(event) => updateSectionTitleHandler(event as ChangeEvent<HTMLInputElement>, section.id)} aria-label="Section title" sx={{ flexGrow: 1 }} /><Chip size="small" label={section.tasks?.length ?? 0} /><IconButton size="small" aria-label="Delete section" onClick={() => { setSectionId(section.id); setOpenSectionAlert(true); }}><Trash2 size={16} /></IconButton></Stack><Button size="small" variant="outlined" fullWidth startIcon={<Plus size={16} />} onClick={() => createTask(section.id)}>Add task</Button><SortableContext items={section.tasks.map((task: Task) => task.id)} strategy={verticalListSortingStrategy}><DroppableColumn id={section.id}>{section.tasks?.map((task: any) => <TaskItem key={task.id} task={task} onDelete={() => { setSelectedTask(task); setOpen(true); }} onDone={onDone} onEdit={() => { setSelectedTask(task); setUpdateOpenSheet(true); }} router={router} />)}</DroppableColumn></SortableContext></Stack></Paper>)}<Button variant="outlined" startIcon={<Plus size={18} />} onClick={() => setSectionOpenDialog(true)} sx={{ minWidth: 160 }}>Add section</Button></Stack><DragOverlay>{activeTask ? <Paper elevation={4} sx={{ p: 2, width: 280 }}><Typography variant="subtitle2">{activeTask.title || "Untitled"}</Typography></Paper> : null}</DragOverlay></DndContext></Stack></>;
};

export default Kanban;
