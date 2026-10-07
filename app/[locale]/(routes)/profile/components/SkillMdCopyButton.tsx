"use client";

import { useState } from "react";
import { Button } from "@mui/material";
import { Check, ContentCopy } from "@mui/icons-material";

const MCP_CONFIG = `{
  "mcpServers": {
    "nextcrm": {
      "type": "http",
      "url": "https://YOUR_NEXTCRM_URL/api/mcp/mcp",
      "headers": { "Authorization": "Bearer YOUR_API_TOKEN" }
    }
  }
}`;
export function SkillMdCopyButton() {
  const [copied, setCopied] = useState(false);
  const copy = () => { void navigator.clipboard.writeText(MCP_CONFIG); setCopied(true); setTimeout(() => setCopied(false), 2000); };
  return <Button variant="outlined" startIcon={copied ? <Check /> : <ContentCopy />} onClick={copy}>{copied ? "Copied!" : "Copy MCP Config"}</Button>;
}
