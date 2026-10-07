"use client";

import { useState } from "react";
import { Download, Loader2 } from "lucide-react";
import { Button, Menu, MenuItem } from "@mui/material";
import { exportTargets } from "@/lib/spreadsheet/export-targets";

interface ExportTargetsButtonProps {
  getTargets: () => Record<string, unknown>[];
  filenameBase: string;
  disabled?: boolean;
}

const ExportTargetsButton = ({ getTargets, filenameBase, disabled }: ExportTargetsButtonProps) => {
  const [isExporting, setIsExporting] = useState(false);
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);
  const handleExport = async (format: "csv" | "xlsx") => {
    setAnchor(null);
    setIsExporting(true);
    try { await exportTargets(getTargets(), format, filenameBase); }
    finally { setIsExporting(false); }
  };
  return <>
    <Button size="small" variant="outlined" disabled={disabled || isExporting} startIcon={isExporting ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />} onClick={(event) => setAnchor(event.currentTarget)}>Export</Button>
    <Menu anchorEl={anchor} open={!!anchor} onClose={() => setAnchor(null)}>
      <MenuItem onClick={() => handleExport("csv")}>Export CSV</MenuItem>
      <MenuItem onClick={() => handleExport("xlsx")}>Export Excel</MenuItem>
    </Menu>
  </>;
};

export default ExportTargetsButton;
