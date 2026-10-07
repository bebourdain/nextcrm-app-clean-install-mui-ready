"use client";

import { useState } from "react";
import { Row } from "@tanstack/react-table";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Box, Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Divider, Drawer, IconButton, Menu, MenuItem, Typography } from "@mui/material";
import { MoreHorizontal } from "lucide-react";
import { taskSchema } from "../data/schema";
import UpdateProjectForm from "../forms/UpdateProject";
import { deleteProject } from "@/actions/projects/delete-project";
import { watchProject, unwatchProject } from "@/actions/projects/watch-project";

export function DataTableRowActions<TData>({ row }: { row: Row<TData> }) {
  const router = useRouter();
  const project = taskSchema.parse(row.original);
  const t = useTranslations("ProjectsPage");
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  async function remove() {
    setLoading(true);
    try { const result = await deleteProject(project.id); if (result?.error) toast.error(result.error); else toast.success(`Project: ${project.title}, deleted successfully`); }
    catch { toast.error(t("dataTable.deleteError")); }
    finally { router.refresh(); setConfirmOpen(false); setLoading(false); }
  }
  async function watch(watching: boolean) {
    setLoading(true);
    try { const result = await (watching ? watchProject(project.id) : unwatchProject(project.id)); if (result?.error) toast.error(result.error); else toast.success(watching ? `Project: ${project.title}, watched successfully` : `Project: ${project.title}, You stop watching this project successfully`); }
    catch { toast.error(t("dataTable.watchError")); }
    finally { setLoading(false); }
  }
  return <><IconButton size="small" aria-label={t("dataTable.openMenu")} onClick={(event) => setAnchor(event.currentTarget)}><MoreHorizontal size={18} /></IconButton><Menu anchorEl={anchor} open={!!anchor} onClose={() => setAnchor(null)}><MenuItem onClick={() => { setAnchor(null); router.push(`/projects/boards/${project.id}`); }}>{t("dataTable.viewDetail")}</MenuItem><MenuItem onClick={() => { setAnchor(null); setEditOpen(true); }}>{t("dataTable.edit")}</MenuItem><Divider /><MenuItem disabled={loading} onClick={() => { setAnchor(null); watch(true); }}>{t("dataTable.watchProject")}</MenuItem><MenuItem disabled={loading} onClick={() => { setAnchor(null); watch(false); }}>{t("dataTable.stopWatching")}</MenuItem><Divider /><MenuItem onClick={() => { setAnchor(null); setConfirmOpen(true); }} sx={{ color: "error.main" }}>{t("dataTable.delete")}</MenuItem></Menu>
  <Drawer anchor="right" open={editOpen} onClose={() => setEditOpen(false)}><Box sx={{ width: { xs: "100vw", sm: 520 }, maxWidth: "100vw", p: 3 }}><Typography variant="h6">{t("dataTable.editProject")}</Typography><Typography color="text.secondary">{t("dataTable.editProjectDesc")}</Typography><UpdateProjectForm initialData={project} openEdit={setEditOpen} /></Box></Drawer>
  <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}><DialogTitle>Delete project?</DialogTitle><DialogContent><DialogContentText>Are you sure you want to delete this project?</DialogContentText></DialogContent><DialogActions><Button onClick={() => setConfirmOpen(false)}>Cancel</Button><Button color="error" variant="contained" onClick={remove} disabled={loading}>{loading ? "Deleting…" : "Delete"}</Button></DialogActions></Dialog></>;
}
