"use client";

import type { ReactNode } from "react";
import { Box, Stack, Typography } from "@mui/material";

type MuiPageHeaderProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: ReactNode;
  headingComponent?: "h1" | "h2" | "h3";
};

export function MuiPageHeader({
  eyebrow,
  title,
  description,
  action,
  headingComponent = "h1",
}: MuiPageHeaderProps) {
  return (
    <Stack
      direction={{ xs: "column", sm: "row" }}
      spacing={2}
      sx={{ justifyContent: "space-between", alignItems: { xs: "flex-start", sm: "center" } }}
    >
      <Box>
        {eyebrow && (
          <Typography
            variant="overline"
            color="primary"
            sx={{ fontWeight: 800, letterSpacing: "0.14em" }}
          >
            {eyebrow}
          </Typography>
        )}
        <Typography variant="h4" component={headingComponent}>
          {title}
        </Typography>
        {description && (
          <Typography color="text.secondary" sx={{ mt: 0.75, maxWidth: 720 }}>
            {description}
          </Typography>
        )}
      </Box>
      {action}
    </Stack>
  );
}
