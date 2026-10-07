"use client";

import { Avatar } from "@mui/material";
import { useAvatarContext } from "@/context/avatar-context";

export function ProfileHeroAvatar({ avatar, name }: { avatar: string | null; name: string | null }) {
  const { avatar: contextAvatar } = useAvatarContext();
  const currentAvatar = contextAvatar || avatar;
  const initials = name ? name.split(" ").map((part) => part[0]).join("").toUpperCase().slice(0, 2) : "?";
  return <Avatar src={currentAvatar ?? undefined} alt={name ?? "User avatar"} sx={{ width: 64, height: 64, border: "2px solid rgba(255,255,255,0.5)", bgcolor: "rgba(255,255,255,0.25)", fontSize: 22 }}>{initials}</Avatar>;
}
