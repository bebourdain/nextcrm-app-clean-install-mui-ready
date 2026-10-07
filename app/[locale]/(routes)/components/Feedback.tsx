"use client";

import { useState, type MouseEvent } from "react";
import { Box, Button, Popover } from "@mui/material";
import ChatOutlinedIcon from "@mui/icons-material/ChatOutlined";
import FeedbackForm from "./FeedbackForm";
import { MuiHeaderNotice, type HeaderNotice } from "@/components/mui/MuiHeaderNotice";

export default function Feedback() {
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);
  const [notice, setNotice] = useState<HeaderNotice | null>(null);
  const open = Boolean(anchor);

  const openPopover = (event: MouseEvent<HTMLElement>) => setAnchor(event.currentTarget);

  return (
    <>
      <Button
        variant="contained"
        onClick={openPopover}
        startIcon={<ChatOutlinedIcon sx={{ fontSize: 18 }} />}
        aria-haspopup="dialog"
        aria-expanded={open}
        sx={{ display: { xs: "none", sm: "inline-flex" }, height: 40, bgcolor: "action.hover", color: "text.primary", "&:hover": { bgcolor: "action.selected" } }}
      >
        Feedback
      </Button>
      <Popover
        open={open}
        anchorEl={anchor}
        onClose={() => setAnchor(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Box sx={{ p: 2 }}>
          <FeedbackForm setOpen={(nextOpen) => { if (!nextOpen) setAnchor(null); }} notify={setNotice} />
        </Box>
      </Popover>
      <MuiHeaderNotice notice={notice} onClose={() => setNotice(null)} />
    </>
  );
}
