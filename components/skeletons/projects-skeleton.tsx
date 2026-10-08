import { Box, Skeleton, Stack } from "@mui/material";
import TableSkeleton from "./table-skeleton";

export default function ProjectsSkeleton() {
  return <Stack spacing={2} sx={{ flex: 1, p: 3 }}>
    <Box><Skeleton variant="rounded" width={192} height={36} /><Skeleton width={288} height={18} sx={{ mt: 1 }} /></Box>
    <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap", gap: 1 }}>{Array.from({ length: 5 }).map((_, index) => <Skeleton key={index} variant="rounded" width={112} height={36} />)}</Stack>
    <Skeleton width={96} height={28} /><TableSkeleton />
  </Stack>;
}
