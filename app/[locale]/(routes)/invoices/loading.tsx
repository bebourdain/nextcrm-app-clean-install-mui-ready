import { Box, Skeleton, Stack } from "@mui/material";

export default function Loading() {
  return <Box sx={{ p: 3 }}><Stack spacing={2}><Skeleton variant="text" width={192} height={40} /><Skeleton variant="rounded" height={256} /></Stack></Box>;
}
