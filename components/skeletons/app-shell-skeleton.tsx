import { Box, Divider, Skeleton, Stack } from "@mui/material";

export default function AppShellSkeleton() {
  return <Box sx={{ display: "flex", width: "100%", height: "100vh", bgcolor: "background.default" }}>
    <Stack spacing={2} sx={{ width: 256, p: 2, borderRight: 1, borderColor: "divider", flexShrink: 0 }}>
      <Skeleton variant="rounded" width={128} height={32} />
      {Array.from({ length: 8 }).map((_, index) => <Skeleton key={index} variant="rounded" height={36} />)}
    </Stack>
    <Box sx={{ flex: 1, minWidth: 0 }}><Box sx={{ p: 2 }}><Skeleton variant="rounded" width={192} height={32} /></Box><Divider /><Stack spacing={2} sx={{ p: 4 }}><Skeleton variant="rounded" width={256} height={36} /><Skeleton width={384} height={18} /><Skeleton variant="rounded" height={384} /></Stack></Box>
  </Box>;
}
