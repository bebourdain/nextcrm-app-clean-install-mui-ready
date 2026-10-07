import { Box, Paper, Skeleton, Stack } from "@mui/material";

export default function Loading() {
  return <Box sx={{ p: { xs: 2, md: 3 } }}>
    <Skeleton variant="text" width={240} height={48} />
    <Skeleton variant="text" width={360} />
    <Paper variant="outlined" sx={{ mt: 3, overflow: "hidden" }}>
      <Stack direction="row" spacing={2} sx={{ p: 3, alignItems: "center" }}><Skeleton variant="circular" width={64} height={64} /><Stack spacing={1}><Skeleton width={180} /><Skeleton width={250} /></Stack></Stack>
      <Skeleton variant="rectangular" height={52} />
      <Stack spacing={2} sx={{ p: 3 }}><Skeleton width={180} /><Skeleton variant="rectangular" height={140} /><Skeleton variant="rectangular" height={140} /></Stack>
    </Paper>
  </Box>;
}
