"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AutoAwesome } from "@mui/icons-material";
import { Alert, Box, Button, CircularProgress, Divider, Paper, Stack, Tab, Tabs, TextField, Typography } from "@mui/material";
import { TipTapEditor } from "@/components/campaigns/TipTapEditor";
import { createTemplate } from "@/actions/campaigns/templates/create-template";
import { updateTemplate } from "@/actions/campaigns/templates/update-template";
import { generateTemplate } from "@/actions/campaigns/templates/generate-template";
import { previewTemplate } from "@/actions/campaigns/templates/preview-template";

type InitialData = {
  name: string;
  description?: string | null;
  subject_default?: string | null;
  content_html?: string | null;
  content_json?: object | null;
};

type Props = { initialData?: InitialData; templateId?: string };

export default function TemplateEditorForm({ initialData, templateId }: Props) {
  const router = useRouter();
  const isEditing = Boolean(templateId);
  const [name, setName] = useState(initialData?.name ?? "");
  const [description, setDescription] = useState(initialData?.description ?? "");
  const [subject, setSubject] = useState(initialData?.subject_default ?? "");
  const [contentHtml, setContentHtml] = useState(initialData?.content_html ?? "");
  const [contentJson, setContentJson] = useState<object>(initialData?.content_json ?? {});
  const [editorRevision, setEditorRevision] = useState(0);
  const [bodyTab, setBodyTab] = useState(0);
  const [previewHtml, setPreviewHtml] = useState<string | null>(null);
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);
  const [aiPrompt, setAiPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!aiPrompt.trim()) return;
    setIsGenerating(true); setError(null);
    try {
      const result = await generateTemplate(aiPrompt);
      setContentHtml(result.html);
      setContentJson(result.json);
      setEditorRevision((revision) => revision + 1);
      if (result.subject && !subject) setSubject(result.subject);
      setBodyTab(0);
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : "AI generation failed");
    } finally { setIsGenerating(false); }
  };

  const handleBodyTabChange = async (next: number) => {
    setBodyTab(next);
    if (next !== 1) return;
    setIsPreviewLoading(true);
    try {
      const result = await previewTemplate({ contentHtml });
      if (result.error) throw new Error(result.error);
      setPreviewHtml(result.html ?? null);
    } catch (failure) {
      setPreviewHtml(null);
      setError(failure instanceof Error ? failure.message : "Could not render preview");
    } finally { setIsPreviewLoading(false); }
  };

  const handleSave = async () => {
    if (!name.trim()) { setError("Template name is required"); return; }
    if (!subject.trim()) { setError("Subject line is required"); return; }
    setIsSaving(true); setError(null);
    try {
      const values = { name, description: description || undefined, subject_default: subject, content_html: contentHtml, content_json: contentJson };
      const result = isEditing && templateId ? await updateTemplate(templateId, values) : await createTemplate(values);
      if ("error" in result) throw new Error(result.error);
      router.push("/campaigns/templates");
      router.refresh();
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : "Failed to save template");
    } finally { setIsSaving(false); }
  };

  return <Stack spacing={3} sx={{ maxWidth: 900 }}>
    {error && <Alert severity="error" onClose={() => setError(null)}>{error}</Alert>}
    <Paper variant="outlined" sx={{ p: { xs: 2, sm: 3 } }}>
      <Typography variant="h6" sx={{ mb: 2 }}>Template details</Typography>
      <Stack spacing={2.5}>
        <TextField id="name" label="Template Name" value={name} onChange={(event) => setName(event.target.value)} placeholder="e.g. Welcome Email" required fullWidth />
        <TextField id="description" label="Description" value={description} onChange={(event) => setDescription(event.target.value)} placeholder="Optional description" multiline minRows={2} fullWidth />
        <TextField id="subject" label="Subject Line" value={subject} onChange={(event) => setSubject(event.target.value)} placeholder="e.g. Hi {{first_name}}, a quick note from us" required fullWidth />
      </Stack>
    </Paper>

    <Paper variant="outlined" sx={{ p: { xs: 2, sm: 3 }, bgcolor: "action.hover" }}>
      <Stack spacing={2}>
        <Typography variant="h6">Generate with AI</Typography>
        <TextField id="ai-prompt" label="Describe the email you want" value={aiPrompt} onChange={(event) => setAiPrompt(event.target.value)} placeholder="e.g. A warm outreach email introducing our SaaS product to a B2B prospect, focusing on ROI benefits" multiline minRows={3} fullWidth />
        <Button type="button" variant="outlined" startIcon={isGenerating ? <CircularProgress size={18} /> : <AutoAwesome />} onClick={handleGenerate} disabled={isGenerating || !aiPrompt.trim()} sx={{ alignSelf: "flex-start" }}>
          {isGenerating ? "Generating..." : "Generate"}
        </Button>
      </Stack>
    </Paper>

    <Paper variant="outlined" sx={{ p: { xs: 2, sm: 3 } }}>
      <Typography variant="h6" sx={{ mb: 1 }}>Email Body</Typography>
      <Tabs value={bodyTab} onChange={(_, value: number) => { void handleBodyTabChange(value); }} aria-label="Email body view">
        <Tab label="Edit" /><Tab label="Preview" />
      </Tabs>
      <Divider sx={{ mb: 2 }} />
      {bodyTab === 0 ? <TipTapEditor key={editorRevision} content={contentHtml} onChange={(html, json) => { setContentHtml(html); setContentJson(json); }} /> : isPreviewLoading ? <Box sx={{ p: 3, textAlign: "center" }}><CircularProgress size={24} /><Typography color="text.secondary" sx={{ mt: 1 }}>Rendering preview...</Typography></Box> : <Box component="iframe" srcDoc={previewHtml ?? ""} sandbox="" title="Email preview" sx={{ width: "100%", height: 600, border: 1, borderColor: "divider", borderRadius: 1, bgcolor: "white" }} />}
    </Paper>

    <Stack direction="row" spacing={1.5}>
      <Button variant="contained" onClick={handleSave} disabled={isSaving}>{isSaving ? "Saving..." : isEditing ? "Update Template" : "Save Template"}</Button>
      <Button variant="outlined" onClick={() => router.push("/campaigns/templates")}>Cancel</Button>
    </Stack>
  </Stack>;
}
