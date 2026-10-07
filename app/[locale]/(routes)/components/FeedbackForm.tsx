"use client";

import { useState, type FormEvent } from "react";
import { Box, Button, CircularProgress, TextField } from "@mui/material";
import { sendFeedback } from "@/actions/feedback/send-feedback";
import type { HeaderNotice } from "@/components/mui/MuiHeaderNotice";

export default function FeedbackForm({ setOpen, notify }: { setOpen: (open: boolean) => void; notify: (notice: HeaderNotice) => void }) {
  const [feedback, setFeedback] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!feedback.trim()) {
      setError("Feedback must be at least 1 character.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const result = await sendFeedback({ feedback });
      if (result?.error) {
        notify({ message: result.error, severity: "error" });
      } else {
        notify({ message: "Thank you for your feedback.", severity: "success" });
        setFeedback("");
        setOpen(false);
      }
    } catch (error) {
      console.error(error);
      notify({ message: "Something went wrong. Please try again later.", severity: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box component="form" onSubmit={onSubmit} sx={{ display: "grid", gap: 1.5, width: { xs: 280, sm: 320 } }}>
      <TextField
        label="Send us feedback"
        placeholder="Your feedback"
        value={feedback}
        onChange={(event) => {
          setFeedback(event.target.value);
          if (error) setError("");
        }}
        multiline
        minRows={4}
        disabled={loading}
        error={Boolean(error)}
        helperText={error || "We appreciate your feedback. Thank you for helping us make this app better."}
      />
      <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1 }}>
        <Button type="button" variant="outlined" onClick={() => setOpen(false)} disabled={loading} sx={{ color: "text.primary", borderColor: "divider" }}>
          Cancel
        </Button>
        <Button type="submit" variant="contained" disabled={loading} startIcon={loading ? <CircularProgress size={15} color="inherit" /> : undefined}>
          {loading ? "Sending ..." : "Submit"}
        </Button>
      </Box>
    </Box>
  );
}
