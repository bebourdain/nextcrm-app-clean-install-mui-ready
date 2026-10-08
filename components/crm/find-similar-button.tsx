"use client";

import { useState } from "react";
import { Button } from "@mui/material";
import { SimilarRecordsDrawer } from "@/components/crm/similar-records-drawer";

type EntityType = "account" | "contact" | "lead" | "opportunity";
interface FindSimilarButtonProps { entityType: EntityType; recordId: string }

export function FindSimilarButton({ entityType, recordId }: FindSimilarButtonProps) {
  const [open, setOpen] = useState(false);
  return <><Button variant="outlined" size="small" onClick={() => setOpen(true)}>Find Similar</Button><SimilarRecordsDrawer entityType={entityType} recordId={recordId} open={open} onOpenChange={setOpen} /></>;
}
