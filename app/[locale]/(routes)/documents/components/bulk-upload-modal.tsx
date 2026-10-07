"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useDropzone } from "react-dropzone";
import { Box, Button, Chip, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, LinearProgress, Paper, Stack, Typography } from "@mui/material";
import { createDocument } from "@/actions/documents/create-document";
import { checkDuplicate } from "@/actions/documents/check-duplicate";
import { Plus } from "lucide-react";

const ACCEPTED_TYPES: Record<string, string[]> = {
  "application/pdf": [".pdf"],
  "image/jpeg": [".jpg", ".jpeg"],
  "image/png": [".png"],
  "image/gif": [".gif"],
  "image/webp": [".webp"],
  "application/msword": [".doc"],
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
  "text/plain": [".txt"],
};

type FileStatus = "queued" | "checking" | "uploading" | "uploaded" | "duplicate" | "skipped" | "error";

interface QueuedFile {
  file: File;
  status: FileStatus;
  progress: number;
  hash?: string;
  duplicateInfo?: { name: string; createdAt: Date | null };
  error?: string;
}

async function computeHash(file: File): Promise<string> {
  const buffer = await file.arrayBuffer();
  const hashBuffer = await crypto.subtle.digest("SHA-256", buffer);
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

interface BulkUploadModalProps {
  accountId?: string;
}

export function BulkUploadModal({ accountId }: BulkUploadModalProps) {
  const [open, setOpen] = useState(false);
  const [queue, setQueue] = useState<QueuedFile[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const router = useRouter();

  const updateFile = (index: number, updates: Partial<QueuedFile>) => {
    setQueue((prev) => prev.map((f, i) => (i === index ? { ...f, ...updates } : f)));
  };

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newFiles: QueuedFile[] = acceptedFiles.map((file) => ({
      file,
      status: "queued",
      progress: 0,
    }));
    setQueue((prev) => [...prev, ...newFiles]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: ACCEPTED_TYPES,
    maxSize: 64 * 1024 * 1024,
    multiple: true,
  });

  const uploadFile = async (index: number) => {
    const item = queue[index];
    updateFile(index, { status: "uploading", progress: 10 });

    try {
      const folder = item.file.type.startsWith("image/") ? "images" : "documents";
      const res = await fetch("/api/upload/presigned-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          filename: item.file.name,
          contentType: item.file.type,
          folder,
        }),
      });

      if (!res.ok) throw new Error("Failed to get presigned URL");
      const { presignedUrl, fileUrl, key } = await res.json();

      updateFile(index, { progress: 30 });

      const uploadRes = await fetch(presignedUrl, {
        method: "PUT",
        body: item.file,
        headers: { "Content-Type": item.file.type },
      });
      if (!uploadRes.ok) throw new Error(`Upload failed: ${uploadRes.status}`);

      updateFile(index, { progress: 70 });

      await createDocument({
        name: item.file.name,
        url: fileUrl,
        key,
        size: item.file.size,
        mimeType: item.file.type,
        contentHash: item.hash,
        accountId,
      });

      updateFile(index, { status: "uploaded", progress: 100 });
    } catch (err) {
      updateFile(index, {
        status: "error",
        error: err instanceof Error ? err.message : "Upload failed",
      });
    }
  };

  const processQueue = async () => {
    setIsProcessing(true);

    for (let i = 0; i < queue.length; i++) {
      const item = queue[i];
      if (item.status !== "queued") continue;

      updateFile(i, { status: "checking" });
      try {
        const hash = await computeHash(item.file);
        updateFile(i, { hash });

        const result = await checkDuplicate(hash);
        if (result.isDuplicate) {
          updateFile(i, {
            status: "duplicate",
            duplicateInfo: {
              name: result.existingDocument!.name,
              createdAt: result.existingDocument!.createdAt,
            },
          });
          continue;
        }
      } catch {
        // If duplicate check fails, proceed with upload
      }

      await uploadFile(i);
    }

    setIsProcessing(false);
    router.refresh();
  };

  const uploadAnyway = async (index: number) => {
    await uploadFile(index);
    router.refresh();
  };

  const skipFile = (index: number) => {
    updateFile(index, { status: "skipped" });
  };

  const uploadedCount = queue.filter((f) => f.status === "uploaded").length;
  const hasQueued = queue.some((f) => f.status === "queued");

  return <><Button variant="contained" startIcon={<Plus size={18} />} onClick={() => setOpen(true)}>Upload Documents</Button><Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm"><DialogTitle>Upload Documents</DialogTitle><DialogContent><Stack spacing={2}><Box {...getRootProps()} sx={{ border: 2, borderStyle: "dashed", borderColor: isDragActive ? "primary.main" : "divider", bgcolor: isDragActive ? "action.hover" : "background.paper", borderRadius: 2, p: 4, textAlign: "center", cursor: "pointer" }}><input {...getInputProps()} /><Typography sx={{ fontWeight: 600 }}>Drop files here or click to browse</Typography><Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>PDF, DOCX, DOC, TXT, Images — up to 64MB each</Typography></Box>{queue.length > 0 && <Stack spacing={1} sx={{ maxHeight: 300, overflowY: "auto" }}>{queue.map((item, index) => <Paper key={index} variant="outlined" sx={{ p: 1.5 }}><Stack direction="row" spacing={1} sx={{ alignItems: "center", flexWrap: "wrap", gap: 1 }}><StatusIcon status={item.status} /><Typography variant="body2" noWrap sx={{ flexGrow: 1, minWidth: 100 }}>{item.file.name}</Typography><Typography variant="caption" color="text.secondary">{(item.file.size / 1024 / 1024).toFixed(1)} MB</Typography>{item.status === "duplicate" && <Stack direction="row" spacing={0.5}><Button size="small" onClick={() => uploadAnyway(index)}>Upload anyway</Button><Button size="small" color="inherit" onClick={() => skipFile(index)}>Skip</Button></Stack>}{item.status === "error" && <Typography variant="caption" color="error">{item.error}</Typography>}</Stack>{item.status === "uploading" && <LinearProgress variant="determinate" value={item.progress} sx={{ mt: 1 }} />}</Paper>)}</Stack>}</Stack></DialogContent><DialogActions sx={{ justifyContent: "space-between", px: 3, pb: 2 }}><Typography variant="body2" color="text.secondary">{uploadedCount}/{queue.length} uploaded</Typography><Stack direction="row" spacing={1}><Button onClick={() => setOpen(false)}>Close</Button>{hasQueued && <Button variant="contained" onClick={processQueue} disabled={isProcessing}>{isProcessing ? "Uploading..." : "Upload All"}</Button>}</Stack></DialogActions></Dialog></>;
}

function StatusIcon({ status }: { status: FileStatus }) {
  if (status === "checking" || status === "uploading") return <CircularProgress size={18} />;
  const color = status === "uploaded" ? "success" : status === "duplicate" ? "warning" : status === "error" ? "error" : "default";
  return <Chip size="small" variant="outlined" color={color} label={status} sx={{ textTransform: "capitalize" }} />;
}
