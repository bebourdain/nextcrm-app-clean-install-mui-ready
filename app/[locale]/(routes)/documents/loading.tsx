import { Box, Skeleton, Stack } from "@mui/material";

export default function Loading() {
  return <Box sx={{ px: { xs: 2, md: 3 }, py: 3 }}><Skeleton variant="text" width={240} height={42} /><Skeleton variant="text" width={360} /><Stack spacing={2} sx={{ mt: 4 }}><Skeleton variant="rectangular" height={48} /><Skeleton variant="rectangular" height={360} /></Stack></Box>;
}
