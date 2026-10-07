"use client";

import { useState } from "react";
import { FormControlLabel, Switch } from "@mui/material";
import { toast } from "sonner";
import { setEcbAutoUpdate } from "../_actions/currencies";

export function ECBToggle({ initialEnabled }: { initialEnabled: boolean }) {
  const [enabled, setEnabled] = useState(initialEnabled);
  async function handleToggle(checked: boolean) {
    try { await setEcbAutoUpdate(checked); setEnabled(checked); toast.success(`ECB auto-update ${checked ? "enabled" : "disabled"}`); }
    catch { toast.error("Failed to update ECB setting"); }
  }
  return <FormControlLabel label="ECB Auto-Update" control={<Switch checked={enabled} onChange={(event) => handleToggle(event.target.checked)} />} />;
}
