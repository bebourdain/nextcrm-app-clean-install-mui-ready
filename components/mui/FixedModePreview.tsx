"use client";

import { type ReactNode } from "react";
import { Box, Typography } from "@mui/material";
import { ThemeProvider } from "@mui/material/styles";
import { createCrmMuiTheme } from "@/app/providers/MuiProvider";

export type PreviewMode = "light" | "dark";

const previewThemes = {
  light: createCrmMuiTheme("light", true),
  dark: createCrmMuiTheme("dark", true),
};

export function FixedModePreview({
  mode,
  children,
}: {
  mode: PreviewMode;
  children: ReactNode;
}) {
  return (
    <ThemeProvider theme={previewThemes[mode]}>
      <Box
        className={mode}
        data-preview-mode={mode}
        sx={{
          p: { xs: 2.5, sm: 3 },
          border: 1,
          borderColor: "divider",
          borderRadius: "var(--radius)",
          bgcolor: "background.default",
          color: "text.primary",
          colorScheme: mode,
          minWidth: 0,
        }}
      >
        <Typography variant="overline" color="primary" sx={{ display: "block", fontWeight: 800, mb: 1.5 }}>
          {mode} mode example
        </Typography>
        {children}
      </Box>
    </ThemeProvider>
  );
}
