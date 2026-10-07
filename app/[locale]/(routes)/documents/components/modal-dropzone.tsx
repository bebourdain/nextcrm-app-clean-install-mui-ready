"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { useDropzone } from "react-dropzone";
import { Box, Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, Stack, Typography } from "@mui/material";
import { UploadCloud } from "lucide-react";
import { createDocument } from "@/actions/documents/create-document";
import { toast } from "sonner";

type FileType = "pdfUploader" | "imageUploader" | "docUploader" | "profilePhotoUploader";
type Props = { buttonLabel: string; fileType: FileType };
const MIME_MAP: Record<FileType, string> = {
  pdfUploader: "application/pdf",
  imageUploader: "image/*",
  docUploader: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  profilePhotoUploader: "image/*",
};
const CONFIG: Record<FileType, { folder: "avatars" | "images" | "documents"; accept: Record<string, string[]>; maxSizeMB: number }> = {
  profilePhotoUploader: { folder: "avatars", accept: { "image/*": [] }, maxSizeMB: 4 },
  imageUploader: { folder: "images", accept: { "image/*": [] }, maxSizeMB: 4 },
  pdfUploader: { folder: "documents", accept: { "application/pdf": [".pdf"] }, maxSizeMB: 64 },
  docUploader: { folder: "documents", accept: { "application/msword": [".doc"], "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"], "text/plain": [".txt"] }, maxSizeMB: 64 },
};

export default function ModalDropzone({ buttonLabel, fileType }: Props) {
  const [open, setOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState<string | null>(null);
  const router = useRouter();
  const config = CONFIG[fileType];
  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;
    setUploading(true);
    setProgress("Requesting upload URL...");
    let uploadedToStorage = false;
    try {
      const response = await fetch("/api/upload/presigned-url", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ filename: file.name, contentType: file.type, folder: config.folder }) });
      if (!response.ok) throw new Error("Failed to get upload URL");
      const { presignedUrl, fileUrl, key } = await response.json();
      setProgress("Uploading...");
      const uploadResponse = await fetch(presignedUrl, { method: "PUT", body: file, headers: { "Content-Type": file.type } });
      if (!uploadResponse.ok) throw new Error("Upload to storage failed");
      uploadedToStorage = true;
      const filename = fileUrl.split("/").pop() ?? "document";
      await createDocument({ name: filename, url: fileUrl, key, size: 0, mimeType: MIME_MAP[fileType] ?? "application/octet-stream" });
      toast.success("Document uploaded successfully");
      setOpen(false);
      router.refresh();
    } catch (error) {
      toast.error(uploadedToStorage ? "Failed to save document" : `Upload error: ${error instanceof Error ? error.message : "Upload failed"}`);
    } finally { setUploading(false); setProgress(null); }
  }, [config.folder, fileType, router]);
  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, maxFiles: 1, maxSize: config.maxSizeMB * 1024 * 1024, accept: config.accept, disabled: uploading });
  return <><Button variant="contained" onClick={() => setOpen(true)}>{buttonLabel}</Button><Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm"><DialogTitle>Upload File</DialogTitle><DialogContent><Stack spacing={2}><Typography color="text.secondary">Select a file to upload</Typography><Box {...getRootProps()} sx={{ border: 2, borderStyle: "dashed", borderColor: isDragActive ? "primary.main" : "divider", borderRadius: 2, p: 4, textAlign: "center", cursor: uploading ? "not-allowed" : "pointer", bgcolor: isDragActive ? "action.hover" : "background.paper" }}><input {...getInputProps()} />{uploading ? <Stack sx={{ alignItems: "center" }} spacing={1}><CircularProgress size={30} /><Typography variant="body2">{progress}</Typography></Stack> : <Stack sx={{ alignItems: "center" }} spacing={1}><UploadCloud size={30} /><Typography variant="body2">{isDragActive ? "Drop file here" : "Drag & drop or click to upload"}</Typography><Typography variant="caption" color="text.secondary">Max {config.maxSizeMB}MB</Typography></Stack>}</Box></Stack></DialogContent><DialogActions><Button onClick={() => setOpen(false)} disabled={uploading}>Close</Button></DialogActions></Dialog></>;
}
