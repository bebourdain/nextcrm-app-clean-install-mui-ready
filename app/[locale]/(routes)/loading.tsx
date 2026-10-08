import { Box, Divider, Paper, Skeleton, Stack } from "@mui/material";

function StatCardSkeleton({ storage = false }: { storage?: boolean }) {
  return <Paper variant="outlined" sx={{ p: 2 }}>
    <Stack direction="row" sx={{ justifyContent: "space-between" }}><Skeleton width={96} /><Skeleton width={20} /></Stack>
    <Skeleton width={storage ? 96 : 64} height={40} />
    {storage && <Skeleton width="100%" height={12} sx={{ mt: 1 }} />}
  </Paper>;
}
export default function DashboardLoading() {
  return <Box sx={{ p: { xs: 2, md: 3 }, height: "100%", overflow: "hidden" }}>
    <Skeleton width={192} height={44} />
    <Skeleton width={288} height={22} />
    <Divider sx={{ my: 2 }} />
    <Box sx={{ display: "grid", gap: 2, gridTemplateColumns: { xs: "1fr", md: "repeat(2, minmax(0, 1fr))", lg: "repeat(3, minmax(0, 1fr))" } }}>
      {Array.from({ length: 8 }).map((_, index) => <StatCardSkeleton key={index} />)}
      <StatCardSkeleton storage />
    </Box>
  </Box>;
}
