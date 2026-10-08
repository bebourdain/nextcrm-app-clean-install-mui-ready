"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Box, CircularProgress, Typography } from "@mui/material";
import { UploadCloud } from "lucide-react";

interface MinioUploaderProps {
  folder: "avatars" | "images" | "documents";
  accept?: Record<string, string[]>;
  maxSizeMB?: number;
  onUploadComplete: (url: string, key: string) => void;
  onUploadError?: (error: string) => void;
}

export function MinioUploader({
  folder,
  accept,
  maxSizeMB = 64,
  onUploadComplete,
  onUploadError,
}: MinioUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState<string | null>(null);

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (!file) return;

      setUploading(true);
      setProgress("Requesting upload URL...");

      try {
        // Step 1: Get presigned URL from our server
        const res = await fetch("/api/upload/presigned-url", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            filename: file.name,
            contentType: file.type,
            folder,
          }),
        });

        if (!res.ok) throw new Error("Failed to get upload URL");
        const { presignedUrl, fileUrl, key } = await res.json();

        setProgress("Uploading...");

        // Step 2: PUT file directly to MinIO
        const uploadRes = await fetch(presignedUrl, {
          method: "PUT",
          body: file,
          headers: { "Content-Type": file.type },
        });

        if (!uploadRes.ok) throw new Error("Upload to storage failed");

        setProgress(null);
        onUploadComplete(fileUrl, key);
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Upload failed";
        setProgress(null);
        onUploadError?.(msg);
      } finally {
        setUploading(false);
      }
    },
    [folder, onUploadComplete, onUploadError]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxFiles: 1,
    maxSize: maxSizeMB * 1024 * 1024,
    accept,
    disabled: uploading,
  });

  return (
    <Box
      component="div"
      {...getRootProps()}
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 1,
        p: 4,
        textAlign: "center",
        border: 2,
        borderStyle: "dashed",
        borderColor: isDragActive ? "primary.main" : "divider",
        borderRadius: 2,
        bgcolor: isDragActive ? "action.hover" : "transparent",
        cursor: uploading ? "not-allowed" : "pointer",
        opacity: uploading ? 0.6 : 1,
        transition: "border-color 150ms, background-color 150ms",
        "&:hover": uploading ? undefined : { borderColor: "primary.main" },
      }}
    >
      <input {...getInputProps()} />
      {uploading ? (
        <>
          <CircularProgress size={32} color="inherit" />
          <Typography variant="body2" color="text.secondary">{progress}</Typography>
        </>
      ) : (
        <>
          <UploadCloud size={32} aria-hidden="true" />
          <Typography variant="body2" color="text.secondary">
            {isDragActive ? "Drop file here" : "Drag & drop or click to upload"}
          </Typography>
          <Typography variant="caption" color="text.disabled">Max {maxSizeMB}MB</Typography>
        </>
      )}
    </Box>
  );
}
