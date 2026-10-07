import { Box, Skeleton, Stack } from "@mui/material";

export function EmailsSkeleton() {
  return <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "20% 35% 45%" }, border: 1, borderColor: "divider", borderRadius: 1, overflow: "hidden", minHeight: 520 }}>
    <Box sx={{ p: 2, borderRight: 1, borderColor: "divider" }}><Skeleton height={40} /><Stack spacing={1} sx={{ mt: 2 }}><Skeleton height={32} /><Skeleton height={32} /><Skeleton height={32} /></Stack></Box>
    <Box sx={{ p: 2, borderRight: 1, borderColor: "divider" }}><Skeleton height={40} /><Stack spacing={1} sx={{ mt: 2 }}><Skeleton height={75} /><Skeleton height={75} /><Skeleton height={75} /></Stack></Box>
    <Box sx={{ p: 2 }}><Skeleton height={40} /><Skeleton variant="rounded" height={300} sx={{ mt: 2 }} /></Box>
  </Box>;
}
