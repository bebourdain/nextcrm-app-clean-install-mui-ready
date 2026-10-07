"use client";
import { useState } from "react";
import { Alert, Box, Button, List, ListItemButton, ListItemText, Paper, Stack, Tab, Tabs, TextField, Typography } from "@mui/material";
import { TipTapEditor } from "@/components/campaigns/TipTapEditor";
import { generateTemplate } from "@/actions/campaigns/templates/generate-template";

type Template = { id: string; name: string; subject_default: string | null; content_html: string };
type Props = {
  initialData: { template_id?: string; content_html?: string; subject?: string };
  templates: Template[];
  onNext: (data: { template_id?: string; content_html: string; content_json: object; subject: string }) => void;
  onBack: () => void;
};

export function Step2Template({ initialData, templates, onNext, onBack }: Props) {
  const [tab, setTab] = useState(0);
  const [prompt, setPrompt] = useState("");
  const [subject, setSubject] = useState(initialData.subject ?? "");
  const [html, setHtml] = useState(initialData.content_html ?? "");
  const [json, setJson] = useState<object>({});
  const [selectedTemplateId, setSelectedTemplateId] = useState(initialData.template_id ?? "");
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState("");
  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setIsGenerating(true); setError("");
    try {
      const result = await generateTemplate(prompt);
      setHtml(result.html); setJson(result.json); setSubject(result.subject);
    } catch (exception) { setError(exception instanceof Error ? exception.message : "Generation failed"); }
    finally { setIsGenerating(false); }
  };
  const handleSelectTemplate = (template: Template) => {
    setSelectedTemplateId(template.id); setHtml(template.content_html); setSubject(template.subject_default ?? "");
  };
  const handleNext = () => {
    if (!subject.trim()) { setError("Subject line is required"); return; }
    if (!html.trim()) { setError("Email content is required"); return; }
    onNext({ template_id: selectedTemplateId || undefined, content_html: html, content_json: json, subject });
  };
  return <Stack spacing={2.5}>
    <Tabs value={tab} onChange={(_, value: number) => setTab(value)}><Tab label="Generate with AI" /><Tab label="Choose Existing" /></Tabs>
    {tab === 0 ? <Stack role="tabpanel" spacing={1.5} sx={{ maxWidth: 600 }}>
      <TextField multiline rows={3} label="Describe your email campaign" value={prompt} onChange={(event) => setPrompt(event.target.value)} />
      <Box><Button variant="outlined" onClick={handleGenerate} disabled={isGenerating || !prompt.trim()}>{isGenerating ? "Generating..." : "Generate"}</Button></Box>
    </Stack> : <Paper role="tabpanel" variant="outlined" sx={{ maxWidth: 600, maxHeight: 220, overflow: "auto" }}>
      <List dense disablePadding>{templates.map((template) => <ListItemButton component="button" type="button" className="text-left" key={template.id} selected={selectedTemplateId === template.id} onClick={() => handleSelectTemplate(template)}><ListItemText primary={template.name} /></ListItemButton>)}
        {!templates.length && <Box sx={{ p: 2 }}><Typography variant="body2" color="text.secondary">No templates yet.</Typography></Box>}
      </List>
    </Paper>}
    <TextField label="Subject Line" required value={subject} onChange={(event) => { setSubject(event.target.value); setError(""); }} placeholder="Your email subject..." sx={{ maxWidth: 600 }} />
    <Box><Typography variant="body2" sx={{ mb: 1, fontWeight: 600 }}>Email Content</Typography><TipTapEditor content={html} onChange={(newHtml, newJson) => { setHtml(newHtml); setJson(newJson); setError(""); }} /></Box>
    {error && <Alert severity="error">{error}</Alert>}
    <Stack direction="row" sx={{ justifyContent: "space-between" }}><Button variant="outlined" onClick={onBack}>← Back</Button><Button variant="contained" onClick={handleNext}>Next →</Button></Stack>
  </Stack>;
}
