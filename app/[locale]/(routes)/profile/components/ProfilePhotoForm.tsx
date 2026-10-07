"use client";

import type { Users } from "@prisma/client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Avatar, Button, Stack, Typography } from "@mui/material";
import { toast } from "sonner";
import { FileUploaderDropzone } from "@/components/ui/file-uploader-dropzone";
import { useAvatarContext } from "@/context/avatar-context";
import { updateProfilePhoto } from "@/actions/user/update-profile-photo";

export function ProfilePhotoForm({ data }: { data: Users }) {
  const [avatar, setAvatar] = useState(data.avatar);
  const [pendingAvatar, setPendingAvatar] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const t = useTranslations("ProfileForm");
  const router = useRouter();
  const { setAvatar: setAvatarContext } = useAvatarContext();
  useEffect(() => { setAvatar(data.avatar); }, [data.avatar]);
  const save = async () => {
    if (!pendingAvatar) return;
    setSaving(true);
    try {
      await updateProfilePhoto(pendingAvatar);
      setAvatar(pendingAvatar); setAvatarContext(pendingAvatar); setPendingAvatar(null);
      toast.success(t("photoUpdatedDescription"), { duration: 5000 }); router.refresh();
    } catch (error) { console.log(error); toast.error(t("photoErrorDescription"), { duration: 5000 }); }
    finally { setSaving(false); }
  };
  return <Stack direction={{ xs: "column", sm: "row" }} spacing={3} sx={{ alignItems: "flex-start" }}>
    <Stack spacing={1} sx={{ alignItems: "center" }}>
      <Avatar src={pendingAvatar ?? avatar ?? "/images/nouser.png"} alt="avatar" sx={{ width: 100, height: 100 }} />
      {pendingAvatar !== null && <Typography variant="caption" color="text.secondary">Preview</Typography>}
    </Stack>
    <Stack spacing={2} sx={{ flex: 1 }}>
      <FileUploaderDropzone uploader="profilePhotoUploader" onUploadSuccess={(newAvatar) => setPendingAvatar(newAvatar)} />
      {pendingAvatar !== null && <Stack direction="row" spacing={1}>
        <Button variant="contained" onClick={save} disabled={saving}>{saving ? "Saving..." : "Save photo"}</Button>
        <Button variant="outlined" onClick={() => setPendingAvatar(null)} disabled={saving}>Cancel</Button>
      </Stack>}
    </Stack>
  </Stack>;
}
