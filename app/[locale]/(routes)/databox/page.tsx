import { Box, Paper, Typography } from "@mui/material";
import { MuiPageHeader } from "@/components/mui/MuiPageHeader";

export default function DataboxPage() {
  return <Box sx={{ p: { xs: 2, md: 3 } }}>
    <MuiPageHeader title="Databox" description="Everything you need to know about Databox alias Datové schránky" />
    <Paper variant="outlined" sx={{ p: 3, mt: 3 }}><Typography color="text.secondary">Module content here</Typography></Paper>
  </Box>;
}
