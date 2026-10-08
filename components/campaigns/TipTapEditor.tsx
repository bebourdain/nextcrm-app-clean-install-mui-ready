"use client";

import { useState } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Underline from "@tiptap/extension-underline";
import { Bold, Italic, Underline as UnderlineIcon, Link as LinkIcon, List, Heading1, Heading2 } from "lucide-react";
import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, Divider, Paper, Stack, TextField, ToggleButton, Typography } from "@mui/material";

type Props = { content?: string; onChange?: (html: string, json: object) => void };

export function TipTapEditor({ content, onChange }: Props) {
  const [linkOpen, setLinkOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const editor = useEditor({
    extensions: [StarterKit, Underline, Link.configure({ openOnClick: false })],
    content: content ?? "",
    immediatelyRender: false,
    onUpdate({ editor }) { onChange?.(editor.getHTML(), editor.getJSON() as object); },
  });

  if (!editor) return null;

  const controls = [
    { value: "bold", label: "Bold", icon: <Bold size={18} />, active: editor.isActive("bold"), run: () => editor.chain().focus().toggleBold().run() },
    { value: "italic", label: "Italic", icon: <Italic size={18} />, active: editor.isActive("italic"), run: () => editor.chain().focus().toggleItalic().run() },
    { value: "underline", label: "Underline", icon: <UnderlineIcon size={18} />, active: editor.isActive("underline"), run: () => editor.chain().focus().toggleUnderline().run() },
    { value: "heading1", label: "Heading 1", icon: <Heading1 size={18} />, active: editor.isActive("heading", { level: 1 }), run: () => editor.chain().focus().toggleHeading({ level: 1 }).run() },
    { value: "heading2", label: "Heading 2", icon: <Heading2 size={18} />, active: editor.isActive("heading", { level: 2 }), run: () => editor.chain().focus().toggleHeading({ level: 2 }).run() },
    { value: "bullet", label: "Bullet list", icon: <List size={18} />, active: editor.isActive("bulletList"), run: () => editor.chain().focus().toggleBulletList().run() },
  ];
  const applyLink = () => {
    if (linkUrl.trim()) editor.chain().focus().setLink({ href: linkUrl.trim() }).run();
    setLinkOpen(false);
  };

  return <>
    <Paper variant="outlined" sx={{ overflow: "hidden" }}>
      <Stack direction="row" spacing={0.5} sx={{ p: 1, flexWrap: "wrap", gap: 0.5, bgcolor: "action.hover" }}>
        {controls.map((control) => <ToggleButton key={control.value} value={control.value} selected={control.active} aria-label={control.label} size="small" onClick={control.run} sx={{ border: 0 }}>
          {control.icon}
        </ToggleButton>)}
        <ToggleButton value="link" selected={editor.isActive("link")} aria-label="Insert link" size="small" onClick={() => { setLinkUrl(editor.getAttributes("link").href ?? ""); setLinkOpen(true); }} sx={{ border: 0 }}><LinkIcon size={18} /></ToggleButton>
      </Stack>
      <Divider />
      <Box sx={{ "& .tiptap": { minHeight: 200, p: 2, outline: 0, color: "text.primary" }, "& .tiptap:focus-visible": { outline: 0 }, "& .tiptap p": { my: 1 } }}><EditorContent editor={editor} /></Box>
      <Typography variant="caption" color="text.secondary" sx={{ display: "block", px: 2, pb: 1 }}>Available merge tags: {"{{first_name}} {{last_name}} {{email}} {{company}} {{position}}"}</Typography>
    </Paper>
    <Dialog open={linkOpen} onClose={() => setLinkOpen(false)} fullWidth maxWidth="xs">
      <DialogTitle>Insert link</DialogTitle>
      <Box component="form" onSubmit={(event) => { event.preventDefault(); applyLink(); }}>
        <DialogContent><TextField autoFocus fullWidth label="URL" type="url" value={linkUrl} onChange={(event) => setLinkUrl(event.target.value)} placeholder="https://example.com" /></DialogContent>
        <DialogActions><Button onClick={() => setLinkOpen(false)}>Cancel</Button><Button type="submit" variant="contained">Apply</Button></DialogActions>
      </Box>
    </Dialog>
  </>;
}
